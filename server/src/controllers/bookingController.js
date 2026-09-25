const prisma = require('../config/db');
const { createNotification } = require('../utils/notificationHelper');

const createBooking = async (req, res) => {
  const { serviceId, slotId, notes } = req.body;
  const learnerId = req.user.id;

  try {
    // 1. Fetch slot and service
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: { expertProfile: { include: { user: true } } }
    });

    if (!slot) {
      return res.status(404).json({ error: 'Availability slot not found.' });
    }

    const service = await prisma.expertService.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Consultation service package not found.' });
    }

    // 2. Validate relations and state
    if (slot.expertProfileId !== service.expertProfileId) {
      return res.status(400).json({ error: 'Selected slot does not belong to this expert.' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: 'Sorry, this slot is no longer available. Please choose another slot.' });
    }

    // Prevent booking past dates using UTC date comparison
    const slotDateOnly = new Date(slot.date);
    const nowUTC = new Date();
    const todayUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));
    if (slotDateOnly < todayUTC) {
      return res.status(400).json({ error: 'Cannot book slots in the past.' });
    }

    // Prevent booking own profile
    if (slot.expertProfile.userId === learnerId) {
      return res.status(400).json({ error: 'You cannot book a session with yourself.' });
    }

    // 3. Create booking and lock slot inside transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Lock the slot
      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: { isBooked: true }
      });

      // Create the booking record
      return await tx.booking.create({
        data: {
          learnerId,
          expertProfileId: slot.expertProfileId,
          serviceId,
          slotId,
          bookingDate: slot.date,
          status: 'PENDING',
          notes: notes || '',
        },
        include: {
          service: true,
          slot: true,
          expertProfile: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });
    });

    // Send Notification to Expert
    await createNotification(
      slot.expertProfile.userId,
      'New Booking Request Received',
      `You have received a new booking request for "${service.serviceTitle}" from ${req.user.name}.`,
      'BOOKING_CREATED'
    );

    return res.status(201).json({
      message: 'Booking request submitted successfully. Waiting for expert approval.',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Internal server error processing booking request.' });
  }
};

const listMyBookings = async (req, res) => {
  const learnerId = req.user.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: { learnerId },
      include: {
        service: true,
        slot: true,
        expertProfile: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing learner bookings:', error);
    return res.status(500).json({ error: 'Internal server error retrieving your bookings.' });
  }
};

const listExpertBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await prisma.expertProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const bookings = await prisma.booking.findMany({
      where: { expertProfileId: profile.id },
      include: {
        service: true,
        slot: true,
        learner: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing expert bookings:', error);
    return res.status(500).json({ error: 'Internal server error retrieving requests.' });
  }
};

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, meetingLink, meetingLocation } = req.body;
  const userId = req.user.id;

  if (!['CONFIRMED', 'REJECTED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status target.' });
  }

  try {
    const profile = await prisma.expertProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Owner check
    if (booking.expertProfileId !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized. This booking belongs to another expert.' });
    }

    // Prevent changing already completed or cancelled bookings
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot modify a booking that is already ${booking.status.toLowerCase()}.` });
    }

    // Process state changes
    if (status === 'CONFIRMED') {
      const isOnline = booking.service.meetingType === 'ONLINE';
      
      if (isOnline && !meetingLink) {
        return res.status(400).json({ error: 'Meeting link (Zoom/Meet) is required for Online consultations.' });
      }
      if (!isOnline && !meetingLocation) {
        return res.status(400).json({ error: 'Meeting location is required for Offline/In-person consultations.' });
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          meetingLink: isOnline ? meetingLink.trim() : null,
          meetingLocation: isOnline ? null : meetingLocation.trim(),
        }
      });

      const meetDetails = isOnline ? `Meeting Link: ${meetingLink.trim()}` : `Location: ${meetingLocation.trim()}`;
      await createNotification(
        booking.learnerId,
        'Booking Request Confirmed',
        `Your booking request for "${booking.service.serviceTitle}" with ${req.user.name} has been confirmed. ${meetDetails}`,
        'BOOKING_CONFIRMED'
      );

      return res.status(200).json({ message: 'Booking confirmed successfully.', booking: updated });
    }

    if (status === 'REJECTED') {
      // Rejecting releases the slot and sets slotId to null on the booking
      const updated = await prisma.$transaction(async (tx) => {
        if (booking.slotId) {
          await tx.availabilitySlot.update({
            where: { id: booking.slotId },
            data: { isBooked: false }
          });
        }

        return await tx.booking.update({
          where: { id },
          data: {
            status: 'REJECTED',
            slotId: null, // release slot connection
          }
        });
      });

      await createNotification(
        booking.learnerId,
        'Booking Request Rejected',
        `Your booking request for "${booking.service.serviceTitle}" with ${req.user.name} was rejected.`,
        'BOOKING_REJECTED'
      );

      return res.status(200).json({ message: 'Booking rejected and slot released.', booking: updated });
    }

    if (status === 'COMPLETED') {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      await createNotification(
        booking.learnerId,
        'Session Completed',
        `Your mentorship session "${booking.service.serviceTitle}" with ${req.user.name} has been completed.`,
        'SESSION_COMPLETED'
      );

      return res.status(200).json({ message: 'Session completed successfully.', booking: updated });
    }

  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ error: 'Internal server error updating booking.' });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        expertProfile: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Owner check
    if (booking.learnerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this booking.' });
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status.toLowerCase()}.` });
    }

    // Cancelling releases slot and sets status to CANCELLED
    const updated = await prisma.$transaction(async (tx) => {
      if (booking.slotId) {
        await tx.availabilitySlot.update({
          where: { id: booking.slotId },
          data: { isBooked: false }
        });
      }

      return await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          slotId: null, // release slot connection
        }
      });
    });

    await createNotification(
      booking.expertProfile.userId,
      'Booking Cancelled by Learner',
      `The booking for "${booking.service.serviceTitle}" has been cancelled by the learner.`,
      'BOOKING_CANCELLED'
    );

    return res.status(200).json({ message: 'Booking cancelled successfully and slot released.', booking: updated });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ error: 'Internal server error cancelling session.' });
  }
};

// Admin operation to monitor bookings
const listAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        slot: true,
        learner: {
          select: { name: true, email: true }
        },
        expertProfile: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error listing all platform bookings:', error);
    return res.status(500).json({ error: 'Internal server error listing all bookings.' });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        slot: true,
        learner: {
          select: { id: true, name: true, email: true }
        },
        expertProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Role and owner check
    const isLearner = booking.learnerId === userId;
    const isExpert = booking.expertProfile.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isLearner && !isExpert && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view this booking.' });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({ error: 'Internal server error retrieving booking details.' });
  }
};

module.exports = {
  createBooking,
  listMyBookings,
  listExpertBookings,
  updateBookingStatus,
  cancelBooking,
  listAllBookings,
  getBookingById,
};

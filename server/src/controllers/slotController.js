const prisma = require('../config/db');

const getExpertProfile = async (userId) => {
  return await prisma.expertProfile.findUnique({
    where: { userId },
  });
};

const createSlot = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found. Please create a profile first.' });
    }

    const slotDate = new Date(date);

    // Check for duplicate slot (same date, start time, end time for this expert)
    const existingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        expertProfileId: profile.id,
        date: slotDate,
        startTime,
        endTime,
      },
    });

    if (existingSlot) {
      return res.status(400).json({ error: 'This availability slot already exists.' });
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        expertProfileId: profile.id,
        date: slotDate,
        startTime,
        endTime,
        isBooked: false,
      },
    });

    return res.status(201).json({
      message: 'Availability slot created successfully',
      slot,
    });
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return res.status(500).json({ error: 'Internal server error creating availability slot.' });
  }
};

const listSlots = async (req, res) => {
  const { expertProfileId } = req.query;

  try {
    if (expertProfileId) {
      // Public view for a specific expert - show unbooked slots
      const slots = await prisma.availabilitySlot.findMany({
        where: {
          expertProfileId,
          isBooked: false,
        },
        orderBy: {
          date: 'asc',
        },
      });
      return res.status(200).json({ slots });
    }

    // Expert's own view (requires authenticated expert)
    if (!req.user || req.user.role !== 'EXPERT') {
      return res.status(400).json({ error: 'Missing expertProfileId in query parameters or authentication.' });
    }

    const profile = await getExpertProfile(req.user.id);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { expertProfileId: profile.id },
      orderBy: { date: 'asc' },
    });

    return res.status(200).json({ slots });
  } catch (error) {
    console.error('Error listing slots:', error);
    return res.status(500).json({ error: 'Internal server error listing slots.' });
  }
};

const updateSlot = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime, isBooked } = req.body;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id },
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found.' });
    }

    // Owner check
    if (slot.expertProfileId !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this slot.' });
    }

    const slotDate = date ? new Date(date) : slot.date;

    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id },
      data: {
        date: slotDate,
        startTime: startTime || slot.startTime,
        endTime: endTime || slot.endTime,
        isBooked: isBooked !== undefined ? isBooked : slot.isBooked,
      },
    });

    return res.status(200).json({
      message: 'Slot updated successfully',
      slot: updatedSlot,
    });
  } catch (error) {
    console.error('Error updating slot:', error);
    return res.status(500).json({ error: 'Internal server error updating slot.' });
  }
};

const deleteSlot = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id },
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found.' });
    }

    // Owner check
    if (slot.expertProfileId !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this slot.' });
    }

    await prisma.availabilitySlot.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).json({ error: 'Internal server error deleting slot.' });
  }
};

module.exports = {
  createSlot,
  listSlots,
  updateSlot,
  deleteSlot,
};

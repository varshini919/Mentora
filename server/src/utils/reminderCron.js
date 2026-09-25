const prisma = require('../config/db');
const { createNotification } = require('./notificationHelper');

const checkReminders = async () => {
  try {
    const now = new Date();

    // Find all confirmed bookings that have missing reminder dispatches
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        OR: [
          { reminderSent24h: false },
          { reminderSent1h: false },
          { reminderSent15m: false },
        ],
      },
      include: {
        slot: true,
        learner: true,
        expertProfile: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    });

    for (const booking of bookings) {
      if (!booking.slot) continue;

      // Construct booking date-time by merging slot date with startTime hours/mins
      const slotDate = new Date(booking.bookingDate);
      const [hours, minutes] = booking.slot.startTime.split(':').map(Number);
      
      const appointmentTime = new Date(Date.UTC(
        slotDate.getUTCFullYear(),
        slotDate.getUTCMonth(),
        slotDate.getUTCDate(),
        hours,
        minutes,
        0,
        0
      ));

      const diffMs = appointmentTime - now;
      const diffMins = diffMs / (1000 * 60);

      // 1. Check 24 Hours Reminder (1440 minutes)
      if (!booking.reminderSent24h && diffMins > 0 && diffMins <= 1440) {
        // Learner notification
        await createNotification(
          booking.learnerId,
          'Upcoming Session Reminder (24 Hours)',
          `Reminder: Your session "${booking.service.serviceTitle}" with mentor ${booking.expertProfile.user.name} starts in 24 hours at ${booking.slot.startTime}.`,
          'SESSION_REMINDER'
        );
        // Expert notification
        await createNotification(
          booking.expertProfile.userId,
          'Upcoming Session Reminder (24 Hours)',
          `Reminder: Your session "${booking.service.serviceTitle}" with learner ${booking.learner.name} starts in 24 hours at ${booking.slot.startTime}.`,
          'SESSION_REMINDER'
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent24h: true },
        });
        console.log(`[Reminders] Sent 24h reminder for Booking ID: ${booking.id}`);
      }

      // 2. Check 1 Hour Reminder (60 minutes)
      if (!booking.reminderSent1h && diffMins > 0 && diffMins <= 60) {
        // Learner notification
        await createNotification(
          booking.learnerId,
          'Upcoming Session Reminder (1 Hour)',
          `Reminder: Your session "${booking.service.serviceTitle}" with mentor ${booking.expertProfile.user.name} starts in 1 hour at ${booking.slot.startTime}.`,
          'SESSION_REMINDER'
        );
        // Expert notification
        await createNotification(
          booking.expertProfile.userId,
          'Upcoming Session Reminder (1 Hour)',
          `Reminder: Your session "${booking.service.serviceTitle}" with learner ${booking.learner.name} starts in 1 hour at ${booking.slot.startTime}.`,
          'SESSION_REMINDER'
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent1h: true },
        });
        console.log(`[Reminders] Sent 1h reminder for Booking ID: ${booking.id}`);
      }

      // 3. Check 15 Minutes Reminder (15 minutes)
      if (!booking.reminderSent15m && diffMins > 0 && diffMins <= 15) {
        // Learner notification
        await createNotification(
          booking.learnerId,
          'Upcoming Session Reminder (15 Minutes)',
          `Reminder: Your session "${booking.service.serviceTitle}" with mentor ${booking.expertProfile.user.name} starts in 15 minutes!`,
          'SESSION_REMINDER'
        );
        // Expert notification
        await createNotification(
          booking.expertProfile.userId,
          'Upcoming Session Reminder (15 Minutes)',
          `Reminder: Your session "${booking.service.serviceTitle}" with learner ${booking.learner.name} starts in 15 minutes!`,
          'SESSION_REMINDER'
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent15m: true },
        });
        console.log(`[Reminders] Sent 15m reminder for Booking ID: ${booking.id}`);
      }
    }
  } catch (error) {
    console.error('Error in checkReminders background worker:', error);
  }
};

const startReminderCron = () => {
  // Check every 60 seconds (1 minute)
  setInterval(checkReminders, 60000);
  console.log('Mentorship Session Reminder worker initialized (1-minute interval).');
};

module.exports = {
  startReminderCron,
};

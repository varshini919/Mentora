const prisma = require('../config/db');

const listNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error listing notifications:', error);
    return res.status(500).json({ error: 'Internal server error retrieving notifications.' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      message: 'Notification marked as read.',
      notification: updated,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Internal server error updating notification.' });
  }
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Internal server error updating notifications.' });
  }
};

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};

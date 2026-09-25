require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;
const { startReminderCron } = require('./utils/reminderCron');

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('Successfully connected to the PostgreSQL database via Prisma.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      startReminderCron();
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  }
};

startServer();

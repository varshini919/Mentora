const express = require('express');
const router = express.Router();

const {
  createBooking,
  listMyBookings,
  listExpertBookings,
  updateBookingStatus,
  cancelBooking,
  listAllBookings,
  getBookingById
} = require('../controllers/bookingController');

const { bookingValidator } = require('../validators/bookingValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Protected routes (All authenticated users can create / read their own bookings)
router.post('/', authenticateJWT, bookingValidator, createBooking);
router.get('/my', authenticateJWT, listMyBookings);
router.get('/:id', authenticateJWT, getBookingById);
router.delete('/:id', authenticateJWT, cancelBooking);

// Expert only routes
router.get('/expert', authenticateJWT, requireRoles('EXPERT'), listExpertBookings);
router.patch('/:id/status', authenticateJWT, requireRoles('EXPERT'), updateBookingStatus);

// Admin only routes
router.get('/all', authenticateJWT, requireRoles('ADMIN'), listAllBookings);

module.exports = router;

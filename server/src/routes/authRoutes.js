const express = require('express');
const router = express.Router();

const { register, login, getCurrentUser } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', authenticateJWT, getCurrentUser);

// Role authorization test routes
router.get('/admin-only', authenticateJWT, requireRoles('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have access to this endpoint.' });
});

router.get('/expert-only', authenticateJWT, requireRoles('EXPERT', 'ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Expert/Admin! You have access to this endpoint.' });
});

module.exports = router;

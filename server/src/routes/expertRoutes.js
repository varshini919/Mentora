const express = require('express');
const router = express.Router();

const { upsertProfile, getOwnProfile, listExperts, getExpertById } = require('../controllers/expertController');
const { profileValidator } = require('../validators/expertValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', listExperts);
router.get('/:id', getExpertById);

// Protected routes (EXPERT only)
router.post('/profile', authenticateJWT, requireRoles('EXPERT'), profileValidator, upsertProfile);
router.get('/profile/me', authenticateJWT, requireRoles('EXPERT'), getOwnProfile);
router.put('/profile', authenticateJWT, requireRoles('EXPERT'), profileValidator, upsertProfile);

module.exports = router;

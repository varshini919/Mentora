const express = require('express');
const router = express.Router();

const { createSlot, listSlots, updateSlot, deleteSlot } = require('../controllers/slotController');
const { slotValidator } = require('../validators/slotValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Public route to view slots for an expert
router.get('/', listSlots);

// Protected routes (EXPERT only)
router.get('/my-slots', authenticateJWT, requireRoles('EXPERT'), listSlots);
router.post('/', authenticateJWT, requireRoles('EXPERT'), slotValidator, createSlot);
router.put('/:id', authenticateJWT, requireRoles('EXPERT'), slotValidator, updateSlot);
router.delete('/:id', authenticateJWT, requireRoles('EXPERT'), deleteSlot);

module.exports = router;

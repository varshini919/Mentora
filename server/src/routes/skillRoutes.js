const express = require('express');
const router = express.Router();

const { listSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { skillValidator } = require('../validators/skillValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Public route
router.get('/', listSkills);

// Admin-only routes
router.post('/', authenticateJWT, requireRoles('ADMIN'), skillValidator, createSkill);
router.put('/:id', authenticateJWT, requireRoles('ADMIN'), skillValidator, updateSkill);
router.delete('/:id', authenticateJWT, requireRoles('ADMIN'), deleteSkill);

module.exports = router;

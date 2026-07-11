const express = require('express');
const router = express.Router();

const { createService, listServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');
const { serviceValidator } = require('../validators/serviceValidator');
const { authenticateJWT, requireRoles } = require('../middleware/authMiddleware');

// Public route to view a service detail
router.get('/:id', getServiceById);

// Protected routes (EXPERT only)
router.post('/', authenticateJWT, requireRoles('EXPERT'), serviceValidator, createService);
router.get('/', authenticateJWT, requireRoles('EXPERT'), listServices);
router.put('/:id', authenticateJWT, requireRoles('EXPERT'), serviceValidator, updateService);
router.delete('/:id', authenticateJWT, requireRoles('EXPERT'), deleteService);

module.exports = router;

const { body, validationResult } = require('express-validator');

const bookingValidator = [
  body('serviceId')
    .trim()
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
  body('slotId')
    .trim()
    .notEmpty()
    .withMessage('Slot ID is required')
    .isUUID()
    .withMessage('Slot ID must be a valid UUID'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  bookingValidator,
};

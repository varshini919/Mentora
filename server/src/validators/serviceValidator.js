const { body, validationResult } = require('express-validator');

const serviceValidator = [
  body('serviceTitle')
    .trim()
    .notEmpty()
    .withMessage('Service title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('meetingType')
    .isIn(['ONLINE', 'OFFLINE'])
    .withMessage('Meeting type must be either ONLINE or OFFLINE'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  serviceValidator,
};

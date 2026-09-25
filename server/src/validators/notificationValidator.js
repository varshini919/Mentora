const { param } = require('express-validator');
const { validationResult } = require('express-validator');

const readNotificationValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Notification ID is required')
    .isUUID()
    .withMessage('Notification ID must be a valid UUID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  readNotificationValidator,
};

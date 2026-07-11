const { body, validationResult } = require('express-validator');

const profileValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required'),
  body('yearsOfExperience')
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative integer'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('hourlyRate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a non-negative number'),
  body('profileImage')
    .optional({ checkFalsy: true })
    .trim(),
  body('linkedinUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('portfolioUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of skill items'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  profileValidator,
};

import express from 'express';
import { body, validationResult } from 'express-validator';
import { saveContactMessage } from '../services/contactService';
import { validateEmail } from '../utils/validation';

const router = express.Router();

// Validation middleware
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .custom(validateEmail)
    .withMessage('Please provide a valid email address'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

router.post('/contact', validateContactForm, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await saveContactMessage(req.body);
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in contact route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

export default router;

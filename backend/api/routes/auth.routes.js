import express from 'express';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyToken, 
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/auth.schema.js';
import { verifyAuth } from '../middleware/auth.middleware.js'; 

const router = express.Router();

//  POST /api/auth/signup
router.post('/signup', validate(signupSchema), signup);

//    POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPassword,
);

// POST /api/auth/reset-password

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  resetPassword,
);

// GET /api/auth/verify
router.get('/verify', verifyAuth, verifyToken);

export default router;


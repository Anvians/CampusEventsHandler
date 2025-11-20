import { z } from 'zod';

// Schema for the signup route
export const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  department: z.string().min(2, 'Department is required'),
  year: z.number().int().min(1).max(5).optional().nullable(),
});

// Schema for the login route
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for forgot-password route
export const forgotPasswordSchema = z.object({
  email: z.string().email('A valid email is required to reset your password'),
});

// Schema for reset-password route
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

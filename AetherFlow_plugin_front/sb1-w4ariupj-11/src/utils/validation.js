import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Username or email is required')
    .max(50, 'Username or email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password is too long'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .refine(val => !/^\d+$/.test(val), 'Username cannot be only numbers'),
  email: z.string()
    .email('Invalid email address')
    .max(50, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password is too long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain both letters and numbers')
    .regex(/^(?=.*[!@#$%^&*])/, 'Password must contain at least one special character'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(50, 'Email is too long')
});

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be less than 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  if (/^\d+$/.test(username)) return 'Username cannot be only numbers';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  if (email.length > 50) return 'Email is too long';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 50) return 'Password is too long';
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return 'Password must contain both letters and numbers';
  if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null; // Optional field
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) return 'Invalid phone number format';
  return null;
};
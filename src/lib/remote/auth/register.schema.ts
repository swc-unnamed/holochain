import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(4, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(4, 'Password confirmation must be at least 8 characters'),
})
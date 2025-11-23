import { z } from 'zod/v4'

export const loginSchema = z.object({
  name: z.string(),
  password: z.string()
})
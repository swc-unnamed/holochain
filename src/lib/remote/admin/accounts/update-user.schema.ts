import { AppRole } from '$lib/generated/prisma/enums';
import { z } from 'zod/v4';

export const updateUserSchema = z.object({
  userId: z.cuid2({ error: 'Invalid user ID' }),
  role: z.enum(AppRole),
  name: z.string(),
  displayName: z.string(),
  approvedMiddle: z.boolean(),
});
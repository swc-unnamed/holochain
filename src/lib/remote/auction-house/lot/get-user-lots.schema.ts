import { LotStatus } from '$lib/generated/prisma/enums';
import { z } from 'zod/v4';

export const getUserLotsSchema = z.object({
  status: z.enum(LotStatus, { error: 'Invalid lot status' }).optional(),
})
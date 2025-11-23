import { LotStatus, LotType } from '$lib/generated/prisma/enums';
import { z } from 'zod/v4';

export const editLotSchema = z.object({
  id: z.cuid2({ error: 'Invalid lot ID' }),
  title: z
    .string()
    .min(1, { error: 'Title is required' })
    .max(255, { error: 'Title must be at most 255 characters' }),
  details: z.string().max(5000, { error: 'Description must be at most 5000 characters' }),
  location: z.string().max(500, { error: 'Location must be at most 500 characters' }),
  anonLot: z.boolean(),
  status: z.enum(LotStatus, { error: 'Invalid lot status' }),
  type: z.enum(LotType, { error: 'Invalid lot type' }),
  startPrice: z.preprocess(
    (value) => (typeof value === 'number' ? value.toString() : value),
    z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Invalid start price format' }),
  ),
})
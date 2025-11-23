import { z } from 'zod/v4';

export const createLotItemSchema = z.object({
  lotId: z.cuid2({ error: 'Invalid lot ID' }),
  entityId: z.cuid2({ error: 'Invalid entity ID' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
  batch: z.boolean(),
  custom: z.boolean(),
  uuu: z.boolean(),
  notes: z.string().max(500, { message: 'Notes must be at most 500 characters' }).nullish()
});
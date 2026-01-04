import { LotStatus } from '$lib/generated/prisma/enums';
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
  startPrice: z.string(),
  createdById: z.cuid2({ error: 'Lot must have a creator' }),
  creditsTo: z.string({ error: 'We have to know where to send the credits!' }),
  purchasedById: z.cuid2().nullish(),
  purchasedByMiddle: z.boolean().default(false),
  purchasePrice: z.string().nullish(),
  middleId: z.cuid2().nullish()
})
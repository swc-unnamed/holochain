import { LotStatus } from '$lib/generated/prisma/enums';
import { z } from 'zod';

export const manageLotSchema = z.object({
  id: z.cuid2({ error: 'Invalid lot ID' }),
  status: z.enum(LotStatus, { error: 'Invalid lot status' }),
  purchasedById: z.cuid2().nullish(),
  purchasePrice: z.number().nullish(),
});
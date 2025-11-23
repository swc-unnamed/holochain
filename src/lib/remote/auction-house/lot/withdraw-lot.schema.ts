import { z } from 'zod/v4';

export const withdrawLotSchema = z.object({
  lotId: z.cuid2({ error: 'Invalid lot ID' }),
})
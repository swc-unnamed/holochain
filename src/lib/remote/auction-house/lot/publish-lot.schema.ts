import { z } from 'zod/v4';

export const publishLotSchema = z.object({
  lotId: z.cuid2(),
});
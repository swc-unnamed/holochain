import z from 'zod';

export const getLotDetailSchema = z.object({
  lotId: z.cuid2(),
})
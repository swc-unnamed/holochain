import { z } from 'zod';

export const getLotSchema = z.object({
  id: z.cuid2({ error: 'Invalid lot ID' }),
})
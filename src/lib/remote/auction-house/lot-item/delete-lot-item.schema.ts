import { z } from 'zod/v4';

export const deleteLotItemSchema = z.object({
  lotId: z.cuid2({ message: 'Invalid lot ID' }),
  itemId: z.cuid2({ message: 'Invalid item ID' }),
});
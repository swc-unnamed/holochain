import { z } from 'zod';

export const getLotForEditSchema = z.object({
  lotId: z.string()
});

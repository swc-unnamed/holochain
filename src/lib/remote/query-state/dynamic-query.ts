import { z } from 'zod';

export const dynamicQuery = z.object({
  where: z.record(z.string(), z.unknown()).optional(),
  orderBy: z.array(z.record(z.string(), z.unknown())).optional(),
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().optional(),

  cursor: z.object({ id: z.string() }).optional()
})
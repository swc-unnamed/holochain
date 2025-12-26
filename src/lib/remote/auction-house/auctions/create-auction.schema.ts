import { z } from 'zod/v4';

export const createAuctionSchema = z
  .object({
    title: z.string().min(5).max(100),
    description: z.string().min(1).max(1000),
    start: z.string().nullish(),
    end: z.string().nullish(),
    lots: z.array(z.cuid2()).min(1, { message: 'At least one Lot must be included in the auction.' }),
  })
  .superRefine((data, ctx) => {
    const hasStart = (data.start ?? '').trim().length > 0;
    const hasEnd = (data.end ?? '').trim().length > 0;

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: 'custom',
        path: hasStart ? ['end'] : ['start'],
        message: 'Start and end must both be provided when scheduling.',
      });
    }
  });

import { AuctionStatus } from '$lib/generated/prisma/enums';
import { z } from 'zod';

export const updateAuctionSchema = z
  .object({
    id: z.cuid2(),
    title: z.string().min(5).max(100),
    status: z.enum(AuctionStatus),
    description: z.string().max(1000).nullish(),
    start: z.string().nullish(),
    end: z.string().nullish(),
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
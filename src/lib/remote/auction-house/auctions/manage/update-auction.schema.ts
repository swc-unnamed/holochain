
import { AuctionStatus } from '$lib/generated/prisma/enums';
import { z } from 'zod';

export const updateAuctionSchema = z
  .object({
    id: z.cuid2(),
    title: z.string().min(5).max(100),
    description: z.string().max(1000).nullish(),
    start: z.string().nullish(),
  });

export const updateAuctionStatusSchema = z.object({
  id: z.cuid2(),
  status: z.enum(AuctionStatus, { error: 'Invalid auction status' }),
})
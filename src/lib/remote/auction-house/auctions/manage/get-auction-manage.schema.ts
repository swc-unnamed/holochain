import { z } from 'zod';

export const getAuctionManageSchema = z.object({
  id: z.cuid2(),
});
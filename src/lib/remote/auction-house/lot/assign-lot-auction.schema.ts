import z from "zod";

export const assignLotAuctionSchema = z.object({
  lotId: z.cuid2({ error: 'Lot must be selected' }),
  auctionId: z.cuid2({ error: 'Auction must be selected' }),
})
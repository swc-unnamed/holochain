import z from "zod";

export const broadcastAuctionSchema = z.object({
  id: z.cuid2()
})
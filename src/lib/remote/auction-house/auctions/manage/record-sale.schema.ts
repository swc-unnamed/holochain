import z from "zod";

export const recordSaleSchema = z.object({
  lotId: z.cuid2({ error: 'Lot is required' }),
  winnerId: z.cuid2().nullish(),
  winningAmount: z.string({ error: "Winning Amount is required" }),
  purchasedViaMiddle: z.boolean().default(false),
  middleId: z.cuid2().nullish(),
})
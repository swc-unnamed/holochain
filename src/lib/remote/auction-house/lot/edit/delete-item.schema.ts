import z from "zod";

export const deleteItemSchema = z.object({
  lotId: z.cuid2({ error: 'Lot must be selected' }),
  itemId: z.cuid2({ error: 'Item must be selected' }),
  reason: z.string().min(1, { error: "Provide a reason for deleting this item." }),
})
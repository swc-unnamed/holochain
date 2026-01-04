import z from "zod";

export const addItemSchema = z.object({
  lotId: z.cuid2({ error: 'Lot must be selected' }),
  entityId: z.cuid2({ error: 'Item must be selected' }),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  batch: z.boolean(),
  custom: z.boolean(),
  customImageUrl: z.url({ error: 'Image must be a valid URL' }).nullish(),
  uuu: z.boolean().default(true),
  reason: z.string().min(1, { error: "Provide a reason for adding this item." }),
})
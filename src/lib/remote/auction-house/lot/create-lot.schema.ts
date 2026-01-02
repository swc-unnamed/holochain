import z from "zod";

export const createLotSchema = z.object({
  title: z.string().min(3, { error: "Title must be at least 3 characters long." }),
  details: z.string().min(1, { error: "Provide details for the Lot" }),
  location: z.string().min(3, { error: "Provide the location of the Lot" }),
  anonLot: z.boolean(),
  startPrice: z.string().refine((val) => {
    // remove commas and parse to Number
    const num = Number(val.replace(/,/g, ''));
    return !isNaN(num) && num >= 0;
  }, { error: "Start Price must be a non-negative number." }),
  creditsTo: z.string().min(3, { error: "Provide who the buyer should send the Credits to" }),
  items: z.array(z.object({
    entityId: z.cuid2({ error: "Invalid Entity ID." }),
    name: z.string().min(1, { error: "Item name cannot be empty." }),
    quantity: z.number().min(1, { error: "Quantity must be at least 1." }),
    batch: z.boolean(),
    custom: z.boolean(),
    customImageUrl: z.url({ error: 'Image must be a valid URL' }).nullish(),
    uuu: z.boolean().default(true),
  }))
})
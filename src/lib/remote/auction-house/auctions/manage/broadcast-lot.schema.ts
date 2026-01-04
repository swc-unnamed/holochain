import z from "zod";

export const broadcastLotSchema = z.object({
  id: z.cuid2()
})
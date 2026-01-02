import z from "zod";

export const withdrawLotSchema = z.object({
  id: z.cuid2(),
})
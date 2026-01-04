import z from "zod";

export const getUserLotSchema = z.object({
  id: z.cuid2(),
})
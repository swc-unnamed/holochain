import z from "zod";

export const withdrawLotAdminSchema = z.object({
  id: z.cuid2(),
  noCtrImpact: z.boolean().default(false)
})
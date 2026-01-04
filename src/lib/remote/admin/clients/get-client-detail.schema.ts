import z from "zod";

export const getClientDetailSchema = z.object({
  id: z.cuid2(),
})
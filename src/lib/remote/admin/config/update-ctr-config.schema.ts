import { ChainTrustRatingKey } from "$lib/generated/prisma/enums";
import z from "zod";

export const updateCtrConfigSchema = z.object({
  data: z.array(z.object({
    key: z.enum(ChainTrustRatingKey, { error: 'Invalid Chain Trust Rating Key' }),
    points: z.number({ error: 'Points must be a number' }),
    reason: z.string({ error: 'Reason is required' }),
    icon: z.string({ error: 'Icon is required' })
  }))
})
import { z } from 'zod/v4';

export const updateAdminConfigSchema = z.object({
  combineClientId: z.string().nullish(),
  combineClientSecret: z.string().nullish(),
  discordClientId: z.string().nullish(),
  discordClientSecret: z.string().nullish()
});
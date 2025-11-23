import { z } from 'zod/v4';

export const updateAdminConfigSchema = z.object({
  combineClientId: z.string().nullish(),
  combineClientSecret: z.string().nullish(),
  globalRequireCombineAuth: z.boolean(),
  globalDisableNameVerification: z.boolean()
});
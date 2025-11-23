import { UserPreferenceKey } from '$lib/generated/prisma/enums';
import { z } from 'zod/v4';

export const updateAccountSchema = z.object({
  displayName: z.string().min(3).max(20).optional(),
  avatarUrl: z.url({ error: 'Must be a valid URL' }).nullable()
});

export const updateAccountPreferenceSchema = z.object({
  key: z.enum(UserPreferenceKey),
  value: z.string(),
})
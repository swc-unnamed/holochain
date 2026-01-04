import { z } from 'zod';

export const updateAuctionConfigSchema = z.object({
  liveDiscordBroadcastWebhookUrl: z.string().url().nullish(),
})
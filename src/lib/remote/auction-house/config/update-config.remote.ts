import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { updateAuctionConfigSchema } from "./update-config.schema";

export const updateAuctionConfig = command(updateAuctionConfigSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['DEVELOPER', 'TZAR']);

  await db.auctionConfiguration.upsert({
    where: { key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL' },
    update: { value: data.liveDiscordBroadcastWebhookUrl },
    create: { key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL', value: data.liveDiscordBroadcastWebhookUrl }
  });
})
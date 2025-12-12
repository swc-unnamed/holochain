import { AuctionConfigurationKey } from "$lib/generated/prisma/enums";

interface AuctionConfigDetail {
  key: AuctionConfigurationKey;
  name: string;
  description: string;
  default: string;
}

export const AuctionConfig: Record<AuctionConfigurationKey, AuctionConfigDetail> = {
  LIVE_DISCORD_BROADCAST_WEBHOOK_URL: {
    key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL',
    name: 'Live - Discord Broadcast Webhook URL',
    description: 'The Discord webhook URL to broadcast live auction events to.',
    default: ''
  }
}
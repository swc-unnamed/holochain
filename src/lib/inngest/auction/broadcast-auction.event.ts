import { env } from "$env/dynamic/private";
import { db } from "$lib/db/prisma";
import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { EmbedBuilder, WebhookClient } from 'discord.js';

export type AuctionBroadcastEvent = {
  id: string;
}

export const broadcastAuctionEvent = inngest.createFunction(
  { id: 'auction-house-broadcast-auction' },
  { event: 'auction-house/broadcast.auction' },
  async ({ event }) => {
    const auction = await db.auction.findUniqueOrThrow({
      where: {
        id: event.data.id
      },
      include: {
        lots: {
          include: {
            _count: {
              select: {
                items: true
              }
            }
          }
        }
      }
    });

    const webhook = await db.auctionConfiguration.findUniqueOrThrow({
      where: {
        key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL'
      }
    });

    if (!webhook.value) {
      console.log('No webhook URL configured, aborting broadcast.');
      throw new NonRetriableError('No webhook URL configured for auction broadcasts.');
    }

    const startTimeUnix = auction.start ? Math.floor(new Date(auction.start).getTime() / 1000) : null;

    const embed = new EmbedBuilder()
      .setTitle(auction.title)
      .setDescription(auction.description || 'No description provided.')
      .setAuthor({
        name: 'Unnamed Market',
        url: env.ORIGIN,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      })
      .setURL(`${env.ORIGIN}/auction-house/auctions/${auction.id}`)
      .setImage(`${env.ORIGIN}/images/uim-18.png`)
      .setFields([
        {
          name: 'Number of Lots',
          value: auction.lots.length.toString(),
        },
        {
          name: 'Total Items up for Auction',
          value: auction.lots.reduce((acc, lot) => acc + lot._count.items, 0).toString(),
        },
        {
          name: 'Auction Starts',
          value: startTimeUnix ? `<t:${startTimeUnix}:R>` : 'Not scheduled',
        }
      ])
      .setFooter({
        text: `Powered by the Holochain`,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      });

    const webhookClient = new WebhookClient({
      url: webhook.value
    });

    await webhookClient.send({
      embeds: [embed]
    });
  }
)
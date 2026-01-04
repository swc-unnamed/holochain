import { db } from "$lib/db/prisma";
import { parseCurrency, toAbbrCurrency } from "$lib/utils/helpers/shared/currency";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { inngest } from "../client";
import { env } from "$env/dynamic/private";
import { NonRetriableError } from "inngest";

export type AuctionLotBroadcastEvent = {
  id: string;
}

export const broadcastAuctionLotEvent = inngest.createFunction(
  {
    id: 'auction-house-broadcast-lot',
    retries: 3
  },
  {
    event: 'auction-house/broadcast.lot',
  },
  async ({ event }) => {

    const lot = await db.lot.findUniqueOrThrow({
      where: {
        id: event.data.id
      },
      include: {
        items: {
          include: {
            entity: {
              select: {
                id: true,
                name: true,
                imageLarge: true
              }
            }
          }
        }
      }
    });

    const startPrice = parseCurrency(lot.startPrice);
    const abbreviated = toAbbrCurrency(startPrice);

    const firstItem = lot.items[0];

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Unnamed Market',
        url: env.ORIGIN,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      })
      .setURL(`${env.ORIGIN}/auction-house/lots/${lot.id}`)
      .setImage(firstItem.entity?.imageLarge)
      .setFooter({
        text: `Powered by the Holochain`,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      })
      .setTitle(`${lot.title} - Starting at ${abbreviated}`)
      .setDescription(lot.details)
      .addFields(lot.items.map((item) => ({
        name: item.name || 'Unnamed Item',
        value: `x${item.quantity} - ${item.batch ? 'Batched' : 'Single'} - ${item.uuu ? 'UUU' : 'Non-UUU'} - ${item.custom ? 'Custom' : 'Standard'}`,
      })))


    const webhook = await db.auctionConfiguration.findUniqueOrThrow({
      where: {
        key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL'
      }
    });

    if (!webhook.value) {
      console.log('No webhook URL configured, aborting broadcast.');
      throw new NonRetriableError('No webhook URL configured for auction broadcasts.');
    }

    const webhookClient = new WebhookClient({
      url: webhook.value
    });

    await webhookClient.send({
      embeds: [embed]
    });
  }
)
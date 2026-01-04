import { EmbedBuilder, WebhookClient } from "discord.js";
import { inngest } from "../client";
import { env } from "$env/dynamic/private";
import { db } from "$lib/db/prisma";
import { parseCurrency } from "$lib/utils/helpers/shared/currency";
import { NonRetriableError } from "inngest";

export type AuctionBroadcastRecordLotSaleEvent = {
  id: string;
  middleId?: string;
}

export const broadcastRecordLotSaleEvent = inngest.createFunction(
  {
    id: 'auction-house-broadcast-record-lot-sale'
  },
  {
    event: 'auction-house/broadcast.record-lot-sale',
  },
  async ({ event }) => {

    const lot = await db.lot.findUniqueOrThrow({
      where: {
        id: event.data.id
      },
      include: {
        purchasedBy: {
          select: {
            displayName: true
          }
        }
      }
    });

    let middleName: string | undefined = undefined;

    if (event.data.middleId) {
      const middle = await db.user.findUniqueOrThrow({
        where: {
          id: event.data.middleId
        }
      });

      middleName = middle.displayName;
    }

    let descr: string;

    if (lot.anonLot) {
      descr = `Lot sold to Middle ${middleName}, purchased by Anonymous Buyer.`;
    } else {
      if (!lot.purchasedBy?.displayName) {
        descr = `Lot sold to a Middle, purchased by an Anonymous Buyer.`;
      } else {
        descr = `Lot sold to ${lot.purchasedBy?.displayName}.`;
      }
    }

    descr = descr + `\n\nTo finalize the transaction, use the following link to transfer credits:`;

    const purchasePrice = parseCurrency(lot.purchasePrice ?? '0');

    const params = new URLSearchParams({
      receiver: 'Unnamed Market',
      amount: purchasePrice.toString(),
      communication: `Purchase of lot #${lot.lotNumber} - lotref~${lot.id}`,
    });

    const encodedUrl =
      `https://www.swcombine.com/members/credits/?${params.toString()}`;

    const url = `[Transfer ${purchasePrice} Credits](${encodedUrl})`;

    descr += `\n${url}`;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Unnamed Market',
        url: env.ORIGIN,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      })
      .setFooter({
        text: `Powered by the Holochain`,
        iconURL: `${env.ORIGIN}/images/uim-18.png`
      })
      .setTitle(`Lot ${lot.lotNumber} Sold!`)
      .setDescription(descr);

    const webhook = await db.auctionConfiguration.findUniqueOrThrow({
      where: {
        key: 'LIVE_DISCORD_BROADCAST_WEBHOOK_URL'
      }
    });

    if (!webhook.value) {
      throw new NonRetriableError('No webhook configured for live discord broadcasts');
    }

    const webhookClient = new WebhookClient({
      url: webhook.value
    });

    await webhookClient.send({
      embeds: [embed]
    });
  }
)
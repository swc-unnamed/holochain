import { db } from "$lib/db/prisma";
import { inngest } from "../client";

export type AuctionBroadcastEvent = {
  name: 'auction/broadcast';
  data: {
    auctionId: string;
  }
}

export const broadcastAuctionEvent = inngest.createFunction(
  { id: 'broadcast-auction' },
  { event: 'auction/broadcast' },
  async ({ event }) => {
    const auction = await db.auction.findUnique({
      where: {
        id: event.data.auctionId
      },
      include: {
        lots: true
      }
    });

    if (!auction) {
      throw new Error(`Auction with ID ${event.data.auctionId} not found.`);
    }

    console.log(`Broadcasting auction ${auction.id} with ${auction.lots.length} lots.`);

    // Here you would add the logic to actually broadcast the auction,
    // e.g., sending notifications, updating a public listing, etc.

    return {
      success: true
    }
  }
)
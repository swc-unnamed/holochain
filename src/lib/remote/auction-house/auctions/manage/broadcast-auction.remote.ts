import { command, getRequestEvent } from "$app/server";
import { inngest } from "$lib/inngest";
import { guard } from "$lib/utils/auth/server-guard";
import { broadcastAuctionSchema } from "./broadcast-auction.schema";


export const broadcastAuction = command(broadcastAuctionSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  await inngest.send({
    name: 'auction-house/broadcast.auction',
    data: {
      id: data.id
    }
  })
})
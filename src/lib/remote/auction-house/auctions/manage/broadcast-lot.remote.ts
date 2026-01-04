import { command, getRequestEvent } from "$app/server";
import { inngest } from "$lib/inngest";
import { guard } from "$lib/utils/auth/server-guard";
import { broadcastLotSchema } from "./broadcast-lot.schema";

export const broadcastLot = command(broadcastLotSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  await inngest.send({
    name: 'auction-house/broadcast.lot',
    data: {
      id: data.id
    }
  })
})
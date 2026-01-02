import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { assignLotAuctionSchema } from "./assign-lot-auction.schema";

export const assignLotAuction = command(assignLotAuctionSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  try {
    await db.lot.update({
      where: {
        id: data.lotId
      },
      data: {
        auctionId: data.auctionId,
        status: 'SCHEDULED'
      }
    });

    return { success: true };
  } catch (err) {
    console.error("Error assigning lot to auction:", err);
    return { success: false, error: 'Failed to assign lot to auction' };
  }
})
import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { withdrawLotAdminSchema } from "./withdraw-lot-admin.schema";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { getCtrConfig } from "$lib/db/shared/get-ctr-config";

export const withdrawLotAdmin = command(withdrawLotAdminSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  const lot = await db.lot.findUniqueOrThrow({
    where: { id: data.id },
    select: {
      id: true,
      createdById: true,
      status: true,
      lotNumber: true
    }
  });

  if (!lot.createdById) {
    throw error(400, { message: "Cannot withdraw a lot that has no creator." });
  }

  await db.lot.update({
    where: {
      id: data.id
    },
    data: {
      status: "WITHDRAWN"
    }
  });

  if (data.noCtrImpact) {
    return;
  } else {

    if (lot.status === 'SCHEDULED') {
      const config = await getCtrConfig('AH_LOT_WITHDRAWN_AFTER_SCHEDULED')
      if (config && config.points !== 0) {
        const pointValue = config.points;
        await db.user.update({
          where: {
            id: lot.createdById
          },
          data: {
            ctr: pointValue < 0 ? { decrement: pointValue } : { increment: pointValue },
            ctrLogs: {
              create: {
                delta: config.points,
                reason: `Withdrew Auction Lot #${lot.lotNumber} after scheduling, reference: ${lot.id}`,
                event: 'AH_LOT_WITHDRAWN_AFTER_SCHEDULED'
              }
            }
          }
        })
      }

    }
  }
})
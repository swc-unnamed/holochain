import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { withdrawLotAdminSchema } from "./withdraw-lot-admin.schema";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";

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
      await db.user.update({
        where: {
          id: lot.createdById
        },
        data: {
          ctr: { decrement: 2 },
          ctrLogs: {
            create: {
              delta: -2,
              reason: `Lot #${lot.lotNumber} withdrawn after it was scheduled for an Auction`
            }
          }
        }
      })
    }
  }
})
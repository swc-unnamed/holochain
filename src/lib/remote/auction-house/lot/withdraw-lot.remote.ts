import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { withdrawLotSchema } from "./withdraw-lot.schema";

export const withdrawLot = command(withdrawLotSchema, async (data) => {
  const { locals } = getRequestEvent();

  const lot = await db.lot.findUniqueOrThrow({
    where: { id: data.id },
    select: {
      id: true,
      createdById: true,
      status: true,
      lotNumber: true
    }
  });

  if (lot.createdById !== locals.user.id) {
    throw error(403, { message: "You are not authorized to withdraw this lot." });
  }
  await db.lot.update({
    where: {
      id: data.id
    },
    data: {
      status: "WITHDRAWN"
    }
  });

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
})
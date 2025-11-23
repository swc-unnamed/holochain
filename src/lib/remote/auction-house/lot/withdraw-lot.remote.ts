import { command, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { withdrawLotSchema } from "./withdraw-lot.schema";
import { guard } from "$lib/utils/auth/server-guard";
import { db } from "$lib/db/prisma";
import { withdrawLotTask } from "$lib/trigger/events/auction-house/lots/lot-withdrawn.task";

export const withdrawLot = command(withdrawLotSchema, async (data) => {
  const { locals } = getRequestEvent();

  const lot = await db.lot.findUnique({
    where: {
      id: data.lotId,
    }
  });

  if (!lot) {
    error(404, {
      message: `Lot with ID ${data.lotId} not found`,
    })
  }

  if (lot.createdById !== locals.user?.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  await db.lot.update({
    where: {
      id: data.lotId
    },
    data: {
      status: 'WITHDRAWN'
    }
  });

  await withdrawLotTask.trigger({ lotId: lot.id, userId: locals.user.id });
})
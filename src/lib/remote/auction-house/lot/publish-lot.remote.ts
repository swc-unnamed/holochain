import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { publishLotSchema } from "./publish-lot.schema";
import { newLotTask } from "$lib/trigger/events/auction-house/lots/lot-listed.task";

export const publishLot = command(publishLotSchema, async (data) => {
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
    error(403, {
      message: `You do not have permission to publish this lot`,
    })
  }

  if (lot.status !== 'DRAFT') {
    error(400, {
      message: `Unable to publish lot, incorrect lot status`,
    })
  }

  if (lot.type !== 'LOT') {
    error(400, {
      message: `Only lots of type 'LOT' can be published`,
    })
  }

  const updatedLot = await db.lot.update({
    where: {
      id: data.lotId
    },
    data: {
      status: 'LISTED'
    }
  });

  await newLotTask.trigger({ lotId: updatedLot.id });
})
import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { editLotSchema } from "./edit-lot.schema";
import { guard } from "$lib/utils/auth/server-guard";

export const editLot = command(editLotSchema, async (data) => {
  const { locals } = getRequestEvent();
  const currentLot = await db.lot.findUnique({
    where: {
      id: data.id
    },
    select: {
      id: true,
      createdById: true,
      status: true
    }
  });

  if (!currentLot) {
    error(404, {
      message: `Lot with ID ${data.id} not found`,
    })
  }

  if (currentLot.createdById !== locals.user.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  await db.lot.update({
    where: {
      id: data.id
    },
    data: {
      title: data.title,
      details: data.details,
      location: data.location,
      anonLot: data.anonLot,
      type: data.type,
      startPrice: data.startPrice.replace(/,/g, '').trim(),
    }
  });

  return {
    success: true
  }

})
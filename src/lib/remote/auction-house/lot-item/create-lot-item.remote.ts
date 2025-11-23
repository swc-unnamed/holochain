import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { createLotItemSchema } from "./create-lot-item.schema";
import { guard } from "$lib/utils/auth/server-guard";

export const createLotItem = command(createLotItemSchema, async (data) => {
  const { locals } = getRequestEvent();
  const lot = await db.lot.findUnique({
    where: {
      id: data.lotId
    }
  });

  if (!lot) {
    error(404, {
      message: `Lot with ID ${data.lotId} not found`,
    })
  }

  if (lot.createdById !== locals.user.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  const entity = await db.entity.findUnique({
    where: {
      id: data.entityId
    }
  });

  if (!entity) {
    error(400, {
      message: `Entity with ID ${data.entityId} not found`,
    })
  }

  await db.lotItem.create({
    data: {
      name: entity.name,
      lotId: data.lotId,
      entityId: data.entityId,
      quantity: data.quantity,
      batch: data.batch,
      custom: data.custom,
      uuu: data.uuu
    }
  });
})
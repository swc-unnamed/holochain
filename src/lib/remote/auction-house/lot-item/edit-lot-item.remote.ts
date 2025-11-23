import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { guard } from "$lib/utils/auth/server-guard";
import { editLotItemSchema } from "./edit-lot-item.schema";

export const editLotItem = command(editLotItemSchema, async (data) => {
  const { locals } = getRequestEvent();
  const lotItem = await db.lotItem.findUnique({
    where: {
      id: data.id
    },
    include: {
      lot: {
        select: {
          id: true,
          createdById: true
        }
      }
    }
  });

  if (!lotItem) {
    error(404, {
      message: `Lot Item with ID ${data.id} not found`,
    })
  }

  if (lotItem.lot.createdById !== locals.user.id) {
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

  await db.lotItem.update({
    where: {
      id: data.id
    },
    data: {
      name: entity.name,
      entityId: data.entityId,
      quantity: data.quantity,
      batch: data.batch,
      custom: data.custom,
      uuu: data.uuu,
      notes: data.notes,
    }
  });
})
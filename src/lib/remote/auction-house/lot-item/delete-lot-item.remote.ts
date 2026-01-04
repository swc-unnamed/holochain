import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { deleteLotItemSchema } from "./delete-lot-item.schema";
import { guard } from "$lib/utils/auth/server-guard";

export const deleteLotItem = command(deleteLotItemSchema, async (data) => {
  const { locals } = getRequestEvent();

  const item = await db.lotItem.findUnique({
    where: {
      id: data.itemId,
      lotId: data.lotId
    },
    select: {
      id: true,
      lot: {
        select: {
          id: true,
          createdById: true
        }
      }
    }
  });

  if (!item) {
    throw error(404, {
      message: `Lot Item with ID ${data.itemId} not found in Lot ${data.lotId}`,
    })
  }

  if (item.lot.createdById !== locals.user.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  await db.lotItem.delete({
    where: {
      id: data.itemId,
      lotId: data.lotId
    }
  });
});
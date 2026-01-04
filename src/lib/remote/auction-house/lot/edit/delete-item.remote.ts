import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { getUserLot } from "../get-user-lot.remote";
import { deleteItemSchema } from "./delete-item.schema";

export const deleteItem = command(deleteItemSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER'])

  const item = await db.lotItem.findUniqueOrThrow({
    where: {
      id: data.itemId
    }
  })

  await db.lot.update({
    where: {
      id: data.lotId
    },
    data: {
      items: {
        delete: {
          id: data.itemId
        }
      },
      history: {
        create: {
          event: `Item deleted: ${item.name} (x${item.quantity}) from Lot by ${locals.user.displayName}. Reason: ${data.reason}`,
        }
      }
    }
  });

  await getUserLot({ id: data.lotId }).refresh();
})
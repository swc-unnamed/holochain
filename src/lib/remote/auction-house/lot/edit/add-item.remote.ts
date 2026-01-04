import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { addItemSchema } from "./add-item.schema";
import { getUserLot } from "../get-user-lot.remote";

export const addItem = command(addItemSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  const lotCheck = await db.lot.count({ where: { id: data.lotId } });
  if (lotCheck === 0) {
    throw error(400, { message: 'Lot does not exist' })
  }

  const entity = await db.entity.findUnique({ where: { id: data.entityId } });
  if (!entity) {
    throw error(400, { message: 'Item does not exist' });
  }

  await db.lot.update({
    where: { id: data.lotId },
    data: {
      items: {
        create: {
          entityId: data.entityId,
          name: entity.name,
          quantity: data.quantity,
          batch: data.batch,
          custom: data.custom,
          customImageUrl: data.customImageUrl,
          uuu: data.uuu,
        }
      },
      history: {
        create: {
          event: `Item added: ${entity.name} (x${data.quantity}) to Lot by ${locals.user.displayName}. Reason: ${data.reason}`,
        }
      }
    }
  });

  await getUserLot({ id: data.lotId }).refresh();
})
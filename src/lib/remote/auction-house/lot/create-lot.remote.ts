import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { parseCurrency } from "$lib/utils/helpers/shared/currency";
import { createLotSchema } from "./create-lot.schema";

export const createLot = command(createLotSchema, async (data) => {
  const { locals } = getRequestEvent();

  // console.log("Create Lot Command Invoked with data:", data);

  const price = parseCurrency(data.startPrice);

  const lot = await db.lot.create({
    data: {
      title: data.title,
      details: data.details,
      location: data.location,
      status: 'SUBMITTED',
      createdById: locals.user.id,
      anonLot: data.anonLot,
      startPrice: price,
      creditsTo: data.creditsTo,
      items: {
        createMany: {
          data: data.items.map(item => ({
            entityId: item.entityId,
            name: item.name,
            quantity: item.quantity,
            batch: item.batch,
            custom: item.custom,
            customImageUrl: item.customImageUrl || null,
          }))
        }
      },
      history: {
        create: {
          event: 'Lot created'
        }
      }
    }
  });

  await db.user.update({
    where: {
      id: locals.user.id
    },
    data: {
      ctr: {
        increment: 1
      },
      ctrLogs: {
        create: {
          delta: 1,
          reason: `Created Auction Lot #${lot.lotNumber}, reference: ${lot.id}`
        }
      }
    },
  });

  return lot;
})
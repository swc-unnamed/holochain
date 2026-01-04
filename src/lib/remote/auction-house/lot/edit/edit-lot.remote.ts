import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { editLotSchema } from "./edit-lot.schema";
import { guard } from "$lib/utils/auth/server-guard";
import { getUserLot } from "../get-user-lot.remote";
import { parseCurrency } from "$lib/utils/helpers/shared/currency";

export const editLot = command(editLotSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  await db.lot.update({
    where: {
      id: data.id
    },
    data: {
      title: data.title,
      details: data.details,
      location: data.location,
      anonLot: data.anonLot,
      startPrice: parseCurrency(data.startPrice),
      status: data.status,
      createdById: data.createdById,
      creditsTo: data.creditsTo,
      purchasedById: data.purchasedById,
      purchasedByMiddle: data.purchasedByMiddle,
      purchasePrice: data.purchasePrice ? parseCurrency(data.purchasePrice) : null,
      history: {
        create: {
          event: `Lot was edited by ${locals.user.displayName}`
        }
      }
    }
  })

  await getUserLot({ id: data.id }).refresh();
})
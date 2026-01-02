import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { editLotSchema } from "./edit-lot.schema";
import { guard } from "$lib/utils/auth/server-guard";

export const editLot = command(editLotSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  await db.lot.update({
    where: {
      id: data.id
    },
    data: {
      title: data.title,
    }
  })

})
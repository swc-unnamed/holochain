import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { getLotSchema } from "./get-lot.schema";

export const getLot = query(getLotSchema, async (params) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  const lot = await db.lot.findUnique({
    where: {
      id: params.id
    },
    include: {
      items: true,
      auction: true
    },
  });

  if (!lot) {
    throw error(404, {
      message: 'Lot not found'
    })
  }

  return lot;
})
import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { getMeLotSchema } from "./get-me-lots.schema";

export const getMeLots = query(getMeLotSchema, async (params) => {
  const { locals } = getRequestEvent();

  const lots = await db.lot.findMany({
    where: {
      createdById: locals.user.id,
      ...params.where
    },
    orderBy: params.orderBy,
    skip: params.skip,
    take: params.take,
    cursor: params.cursor,
    include: {
      items: {
        select: {
          id: true,
          name: true,
          quantity: true,
          batch: true
        }
      },
      auction: {
        select: {
          id: true,
          title: true,
          status: true
        }
      }
    }
  });

  // Get total count for pagination
  const totalCount = await db.lot.count({
    where: {
      createdById: locals.user.id,
      ...params.where
    }
  });

  return { lots, totalCount };
})
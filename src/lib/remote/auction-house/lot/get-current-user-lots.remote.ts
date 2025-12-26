import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { dynamicQuery } from "$lib/remote/query-state/dynamic-query";

export const getCurrentUserLots = query(dynamicQuery, async (params) => {
  const { locals } = getRequestEvent();

  const totalCount = await db.lot.count({
    where: {
      createdById: locals.user.id,
      ...params.where
    }
  });

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

  return {
    lots: lots,
    totalCount: totalCount
  }
})
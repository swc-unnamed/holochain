import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { dynamicQuery } from "../query-state/dynamic-query";

export const getCtrLogs = query(dynamicQuery, async (params) => {
  const { locals } = getRequestEvent();

  const totalCtrLogCount = await db.chainTrustRatingLog.count({
    where: {
      userId: locals.user.id
    }
  });

  const ctrLogs = await db.chainTrustRatingLog.findMany({
    where: {
      userId: locals.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip: params.skip,
    take: params.take
  });

  return {
    logs: ctrLogs,
    totalCount: totalCtrLogCount
  }
})
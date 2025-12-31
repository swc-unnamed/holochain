import { query } from "$app/server";
import { db } from "$lib/db/prisma";
import { dynamicQuery } from "$lib/remote/query-state/dynamic-query";

export const getAuctionArchive = query(dynamicQuery, async (params) => {
  const totalCount = await db.auction.count({
    where: params.where
  });

  const auctions = await db.auction.findMany({
    where: params.where,
    orderBy: params.orderBy,
    skip: params.skip,
    take: params.take,
    include: {
      _count: {
        select: {
          lots: true
        }
      }
    }
  });

  return {
    totalCount: totalCount,
    auctions: auctions
  }
})
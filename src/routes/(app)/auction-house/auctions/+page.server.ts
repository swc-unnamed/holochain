import { db } from "$lib/db/prisma"

export const load = async () => {
  const auctions = await db.auction.findMany({
    where: {
      status: {
        not: 'CANCELLED'
      }
    },
    include: {
      _count: {
        select: { lots: true }
      }
    }
  });

  return {
    auctions: auctions
  }
}
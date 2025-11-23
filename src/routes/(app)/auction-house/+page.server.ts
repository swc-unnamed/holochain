import { db } from "$lib/db/prisma"

export const load = async () => {
  const auctions = await db.auction.findMany({
    where: {
      status: {
        notIn: ['CANCELLED', 'COMPLETED']
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
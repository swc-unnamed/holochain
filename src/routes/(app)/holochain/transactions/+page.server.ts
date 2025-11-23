import { db } from "$lib/db/prisma"

export const load = async () => {
  const transactions = await db.entityTransaction.findMany({
    orderBy: {
      timestamp: 'desc'
    },
    include: {
      entity: {
        select: {
          id: true,
          name: true,
          imageSmall: true,
        }
      }
    }
  });

  return {
    transactions: transactions
  }
}
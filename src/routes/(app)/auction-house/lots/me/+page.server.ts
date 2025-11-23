import { db } from '$lib/db/prisma.js'

export const load = async ({ locals }) => {

  const lots = await db.lot.findMany({
    where: {
      createdById: locals.user.id
    },
    select: {
      id: true,
      title: true,
      startPrice: true,
      purchasePrice: true,
      status: true,
      type: true,
      lotNumber: true,
      _count: {
        select: {
          items: true
        }
      }
    }
  });

  return {
    lots: lots
  }
}
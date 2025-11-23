import { db } from '$lib/db/prisma'

export const load = async () => {
  const entities = await db.entity.findMany({
    select: {
      id: true,
      name: true,
      imageSmall: true,
      type: true,
      _count: {
        select: {
          transactions: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return {
    entities: entities
  }
}
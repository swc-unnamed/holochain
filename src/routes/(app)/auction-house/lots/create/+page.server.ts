import { db } from "$lib/db/prisma"

export const load = async () => {
  const entities = await db.entity.findMany({
    where: {
      enabled: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return {
    entities: entities
  }
}
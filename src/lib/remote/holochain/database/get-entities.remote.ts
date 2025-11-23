import { query } from "$app/server";
import { db } from "$lib/db/prisma";

export const getEntities = query(async () => {
  const entities = await db.entity.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      imageSmall: true
    }
  });

  return entities;
})
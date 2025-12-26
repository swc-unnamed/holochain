import { query } from "$app/server";
import { db } from "$lib/db/prisma";
import { dynamicQuery } from "$lib/remote/query-state/dynamic-query";

export const getEntities = query(dynamicQuery, async (data) => {

  const totalCount = await db.entity.count({ where: data.where });

  const entities = await db.entity.findMany({
    ...data,
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

  // Generate a Set of entity types
  const entityTypes = new Set(entities.map(({ type }) => type).filter((value): value is string => Boolean(value)));

  return { records: entities, totalCount, entityTypes: Array.from(entityTypes) };
})
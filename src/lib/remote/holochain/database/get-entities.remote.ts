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
      imageLarge: true,
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

  return { records: entities, totalCount };
});

export const getEntityTypes = query(async () => {
  const entities = await db.entity.findMany({
    select: {
      type: true
    },
    distinct: ['type']
  });

  return {
    types: entities
  }
});
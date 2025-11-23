import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { getUserLotsSchema } from "./get-user-lots.schema";

export const getUserLots = query(getUserLotsSchema, async (params) => {
  console.log("getUserLots params:", params);

  const { locals } = getRequestEvent();
  const lots = await db.lot.findMany({
    where: {
      createdById: locals.user.id,
    },
    omit: {
      purchasedById: true,
    },
    include: {
      _count: {
        select: {
          items: true
        }
      }
    }
  });

  return lots;
})
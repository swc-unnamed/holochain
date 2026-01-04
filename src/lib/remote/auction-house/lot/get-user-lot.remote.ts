import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { getUserLotSchema } from "./get-user-lot.schema";


export const getUserLot = query(getUserLotSchema, async (params) => {
  const { locals } = getRequestEvent();

  const lot = await db.lot.findUniqueOrThrow({
    where: {
      id: params.id
    },
    include: {
      createdBy: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true
        }
      },
      purchasedBy: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true
        }
      },
      items: {
        include: {
          entity: {
            select: {
              id: true,
              name: true,
              imageLarge: true,
              imageSmall: true
            }
          }
        }
      },
      history: true,
    }
  });

  if (lot.createdById !== locals.user.id) {
    guard(locals, ['AUCTIONEER'])
  }

  return lot;
})
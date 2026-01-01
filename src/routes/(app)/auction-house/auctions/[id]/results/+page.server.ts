import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals, params }) => {
  guard(locals, ['AUCTIONEER']);

  const auction = await db.auction.findUniqueOrThrow({
    where: {
      id: params.id
    },
    include: {
      lots: {
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
          history: true,
          items: {
            include: {
              entity: {
                select: {
                  id: true,
                  name: true,
                  imageSmall: true
                }
              }
            }
          }
        }
      }
    }
  });

  return { auction: auction }
}
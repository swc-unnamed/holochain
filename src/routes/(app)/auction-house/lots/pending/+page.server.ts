import { db } from "$lib/db/prisma"
import { guard } from "$lib/utils/auth/server-guard.js";

export const load = async ({ locals, depends }) => {
  guard(locals, ['AUCTIONEER']);
  depends('ah:lots:pending')

  const lots = await db.lot.findMany({
    where: {
      status: 'SUBMITTED'
    },
    omit: {
      createdById: true,
      creditsTo: true,
      purchasedById: true,
    },
    include: {
      items: {
        select: {
          entity: {
            select: {
              imageSmall: true,
              name: true
            }
          }
        }
      }
    }
  });

  const openAuctions = await db.auction.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'PENDING']
      }
    },
    select: {
      id: true,
      title: true,
      status: true,
      start: true
    }
  });

  return {
    lots: lots,
    openAuctions: openAuctions
  }
}
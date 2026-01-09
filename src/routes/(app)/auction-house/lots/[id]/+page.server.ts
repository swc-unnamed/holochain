import { db } from '$lib/db/prisma.js'

export const load = async ({ params, locals, depends }) => {

  depends('ah:lot:id');

  const lotCheck = await db.lot.findUniqueOrThrow({
    where: {
      id: params.id
    },
    select: {
      anonLot: true,
      createdById: true,
      purchasedById: true
    }
  });

  const lot = await db.lot.findUniqueOrThrow({
    where: {
      id: params.id
    },
    include: {
      items: {
        include: {
          entity: {
            omit: {
              combineHref: true,
              combineData: true
            }
          }
        }
      },
      history: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      createdBy: lotCheck.anonLot ? false : {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          ctr: true
        }
      },
      purchasedBy: lotCheck.anonLot ? false : {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          ctr: true
        }
      },
      transactions: {
        omit: {
          userId: true
        }
      }
    },
    omit: {
      createdById: lotCheck.anonLot ? true : false,
    }
  });

  let sellerAnonId: string | null = null;

  if (lotCheck && lotCheck.anonLot && lotCheck.createdById) {
    const seller = await db.user.findUnique({
      where: {
        id: lotCheck.createdById
      },
      select: {
        anonid: true
      }
    });

    sellerAnonId = seller?.anonid || null;
  }

  const entityIds = lot.items.map(item => item.entityId);

  const latestTransactions = await db.entityTransaction.findMany({
    where: {
      entityId: {
        in: entityIds
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    distinct: ['entityId']
  });

  return {
    lot: lot,
    isOwner: lotCheck.createdById === locals.user.id,
    anonData: {
      sellerAnonId: sellerAnonId,
      buyerAnonId: null,
    },
    entityTransactions: latestTransactions
  }
}
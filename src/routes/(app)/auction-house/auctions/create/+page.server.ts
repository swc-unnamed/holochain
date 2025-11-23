import { db } from '$lib/db/prisma.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['AUCTIONEER']);

  const lots = await db.lot.findMany({
    where: {
      status: 'LISTED',
      type: 'LOT'
    },
    include: {
      createdBy: {
        select: {
          id: true,
          karma: true,
          displayName: true,
          avatarUrl: true,
          anonid: true
        }
      }
    }
  });

  const availableLots = lots.map((lot) => {
    if (lot.anonLot) {
      lot.createdById = null;
      lot.createdBy = {
        id: '',
        avatarUrl: null,
        displayName: '',
        karma: lot.createdBy!.karma,
        anonid: lot.createdBy!.anonid
      }

      return lot;
    }

    lot.createdBy!.anonid = '';
    return lot;
  });

  return {
    lots: availableLots
  }
}
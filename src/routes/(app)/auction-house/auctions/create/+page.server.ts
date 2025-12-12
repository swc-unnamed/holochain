import { db } from '$lib/db/prisma.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['AUCTIONEER']);

  // Fetch anonymous and public lots separately to only pull user data when needed
  const [anonLots, publicLots] = await Promise.all([
    // Anonymous lots - only fetch anonid and karma
    db.lot.findMany({
      where: {
        status: 'LISTED',
        type: 'LOT',
        anonLot: true
      },
      include: {
        createdBy: {
          select: {
            anonid: true,
            karma: true
          }
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            batch: true
          }
        }
      }
    }),
    // Public lots - fetch full user data
    db.lot.findMany({
      where: {
        status: 'LISTED',
        type: 'LOT',
        anonLot: false
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            karma: true
          }
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            batch: true
          }
        }
      }
    })
  ]);

  // Map anonymous lots to have anonid at top level with createdBy set to null
  const mappedAnonLots = anonLots.map((lot) => ({
    ...lot,
    anonid: lot.createdBy?.anonid ?? '',
    creatorKarma: lot.createdBy?.karma ?? 0,
    createdBy: null
  }));

  const availableLots = [...mappedAnonLots, ...publicLots];

  return {
    lots: availableLots
  };
}
import { db } from '$lib/db/prisma.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['AUCTIONEER']);

  // Fetch anonymous and public lots separately to only pull user data when needed
  const [anonLots, publicLots] = await Promise.all([
    // Anonymous lots - only fetch anonid and karma
    db.lot.findMany({
      where: {
        status: 'SUBMITTED',
        anonLot: true
      },
      include: {
        createdBy: {
          select: {
            anonid: true,
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
        status: 'SUBMITTED',
        anonLot: false
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            ctr: true
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
    createdBy: null
  }));

  const availableLots = [...mappedAnonLots, ...publicLots];

  // order the lots by lotNumber ascending
  availableLots.sort((a, b) => a.lotNumber - b.lotNumber);

  return {
    lots: availableLots
  };
}
import { db } from '$lib/db/prisma'
import { guard } from '$lib/utils/auth/server-guard.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, depends }) => {
  depends('auction-house:lot:edit');
  const lot = await db.lot.findUnique({
    where: {
      id: params.id,
    },
    include: {
      items: {
        orderBy: {
          name: 'asc'
        }
      }
    },
  });

  if (!lot) {
    error(404, {
      message: `Lot with ID ${params.id} not found`,
    })
  }

  if (lot.createdById !== locals.user.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  const entities = await db.entity.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      imageSmall: true
    }
  });

  return {
    lot: lot,
    entities: entities
  }
}
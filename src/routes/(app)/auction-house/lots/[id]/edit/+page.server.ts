import { db } from '$lib/db/prisma'
import { guard } from '$lib/utils/auth/server-guard.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals, depends }) => {
  depends('auction-house:lot:edit');
  const lot = await db.lot.findUnique({
    where: {
      id: params.id,
    },
    select: {
      createdById: true
    }
  });

  if (!lot) {
    error(404, {
      message: `Lot with ID ${params.id} not found`,
    })
  }

  if (lot.createdById !== locals.user.id) {
    guard(locals, ['DEVELOPER', 'TZAR'])
  }

  return {
    lotId: params.id,
  };
}
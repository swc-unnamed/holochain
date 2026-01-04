import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js';

export const load = async ({ params, locals, depends }) => {
  depends('ah:lot:edit');
  guard(locals, ['AUCTIONEER']);

  const entities = await db.entity.findMany({
    where: {
      enabled: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return {
    id: params.id,
    entities: entities
  }
}
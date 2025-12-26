import { db } from '$lib/db/prisma'
import { error } from '@sveltejs/kit';

export const load = async ({ locals, depends }) => {
  depends('app:account');
  const account = await db.user.findUnique({
    where: { id: locals.user.id },
    include: {
      preferences: true,
      ctrLogs: {
        orderBy: { createdAt: 'desc' }
      }
    },
    omit: {
      passwordHash: true
    }
  });

  if (!account) {
    throw error(404, 'Account not found');
  }

  return { account: account };
}
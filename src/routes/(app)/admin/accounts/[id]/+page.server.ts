import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js'
import { error } from '@sveltejs/kit';

export const load = async ({ locals, params, depends }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);
  depends('admin:accounts:id');
  const user = await db.user.findUnique({
    where: {
      id: params.id
    },
    include: {
      karmaLogs: true,
      preferences: true
    },
    omit: {
      passwordHash: true,
    }
  });

  if (!user) {
    error(404, 'User not found');
  }

  return {
    userDetails: user
  }
}
import { db } from '$lib/db/prisma.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      karma: true,
      avatarUrl: true,
      role: true,
      anonid: true,
      banned: true,
    },
    orderBy: {
      displayName: 'asc'
    }
  })

  return {
    users: users
  }
}
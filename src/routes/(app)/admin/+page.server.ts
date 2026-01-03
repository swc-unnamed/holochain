import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js'
import { startOfMonth } from 'date-fns';

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER']);

  const linkedDiscordAccountsCount = await db.user.count({
    where: {
      banned: false,
      discordId: {
        not: null
      }
    }
  });

  const monthStart = startOfMonth(new Date());

  const newUsersThisMonth = await db.user.count({
    where: {
      createdAt: {
        gte: monthStart
      }
    }
  });

  const bannedAccountsCount = await db.user.count({
    where: {
      banned: true
    }
  });

  const totalLotCount = await db.lot.count();

  const averageChainTrustPerUser = await db.user.aggregate({
    _avg: {
      ctr: true
    }
  });

  return {
    linkedDiscordAccountsCount,
    newUsersThisMonth,
    bannedAccountsCount,
    totalLotCount,
    averageChainTrustPerUser: averageChainTrustPerUser._avg.ctr || 0
  }
}
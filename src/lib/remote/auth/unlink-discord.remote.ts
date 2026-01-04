import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { getCtrConfig } from "$lib/db/shared/get-ctr-config";

export const unlinkDiscordAccount = command(async () => {
  const { locals } = getRequestEvent();

  const ctrConfig = await getCtrConfig('ACCOUNT_DISCORD_UNLINKED');
  const points = ctrConfig ? ctrConfig.points : 0;

  try {
    await db.user.update({
      where: {
        id: locals.user.id
      },
      data: {
        discordId: null,
        discordUsername: null,
        ctr: points !== 0 ?
          points < 0 ? { decrement: points } : { increment: points } : undefined,
        ctrLogs: points !== 0 ? {
          create: {
            reason: 'Unlinked Discord account',
            delta: points,
            event: 'ACCOUNT_DISCORD_UNLINKED',
          }
        } : undefined
      }
    });
  } catch (err) {
    console.error('Error unlinking Discord account:', err);
    return {
      success: false,
      error: 'Failed to unlink Discord account.'
    }
  }

  return {
    success: true
  }
})
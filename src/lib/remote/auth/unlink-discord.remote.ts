import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";

export const unlinkDiscordAccount = command(async () => {
  const { locals } = getRequestEvent();

  try {
    await db.user.update({
      where: {
        id: locals.user.id
      },
      data: {
        discordId: null,
        discordUsername: null,
        ctr: { decrement: 10 },
        ctrLogs: {
          create: {
            reason: 'Unlinked Discord account',
            delta: -10
          }
        }
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
import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);

  const config = await db.siteConfiguration.findMany();

  const combineClientId = config.find(c => c.key === 'COMBINE_CLIENT_ID')?.value || '';
  const combineClientSecret = config.find(c => c.key === 'COMBINE_CLIENT_SECRET')?.value || '';
  const discordClientId = config.find(c => c.key === 'DISCORD_CLIENT_ID')?.value || '';
  const discordClientSecret = config.find(c => c.key === 'DISCORD_CLIENT_SECRET')?.value || '';

  return {
    combineClientId,
    combineClientSecret,
    discordClientId,
    discordClientSecret
  }
}
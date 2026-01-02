import { db } from '$lib/db/prisma';
import { CTREvent } from '$lib/types/ctr-event-detail.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);

  const config = await db.siteConfiguration.findMany();

  const combineClientId = config.find(c => c.key === 'COMBINE_CLIENT_ID')?.value || '';
  const combineClientSecret = config.find(c => c.key === 'COMBINE_CLIENT_SECRET')?.value || '';
  const discordClientId = config.find(c => c.key === 'DISCORD_CLIENT_ID')?.value || '';
  const discordClientSecret = config.find(c => c.key === 'DISCORD_CLIENT_SECRET')?.value || '';

  const ctrConfig = await db.chainTrustRatingConfig.findMany();

  if (ctrConfig.length === 0) {
    // create an array of default CTR config items using the CTREvent record
    const defaultCtrConfig = Object.values(CTREvent).map(event => ({
      key: event.key,
      points: 0,
      reason: ''
    }));

    await db.chainTrustRatingConfig.createMany({
      data: defaultCtrConfig
    });

    const conf = await db.chainTrustRatingConfig.findMany();

    return {
      combineClientId,
      combineClientSecret,
      discordClientId,
      discordClientSecret,
      ctrConfig: conf
    }
  } else {
    return {
      combineClientId,
      combineClientSecret,
      discordClientId,
      discordClientSecret,
      ctrConfig: ctrConfig
    }
  }
}
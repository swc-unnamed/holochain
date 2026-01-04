import { db } from '$lib/db/prisma';
import type { ChainTrustRatingConfig } from '$lib/generated/prisma/client.js';
import { CTREvent } from '$lib/types/ctr-event-detail.js';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);

  const config = await db.siteConfiguration.findMany();

  const combineClientId = config.find(c => c.key === 'COMBINE_CLIENT_ID')?.value || '';
  const combineClientSecret = config.find(c => c.key === 'COMBINE_CLIENT_SECRET')?.value || '';
  const discordClientId = config.find(c => c.key === 'DISCORD_CLIENT_ID')?.value || '';
  const discordClientSecret = config.find(c => c.key === 'DISCORD_CLIENT_SECRET')?.value || '';

  const ctrConfig = await db.chainTrustRatingConfig.findMany({
    orderBy: {
      key: 'desc'
    }
  });

  const C = Object.keys(CTREvent).length;

  if (ctrConfig.length !== C) {
    console.log('CTR Config incomplete, initializing missing entries...');
    for (const event of Object.values(CTREvent)) {
      await db.chainTrustRatingConfig.upsert({
        where: {
          key: event.key
        },
        create: {
          key: event.key,
          points: 0,
          reason: '',
          icon: 'mdi:progress-star-four-points'
        },
        update: {}
      })
    }

    const conf = await db.chainTrustRatingConfig.findMany({
      orderBy: {
        key: 'asc'
      }
    });

    return {
      combineClientId,
      combineClientSecret,
      discordClientId,
      discordClientSecret,
      ctrConfig: orderCtrKeys(conf)
    }
  } else {
    return {
      combineClientId,
      combineClientSecret,
      discordClientId,
      discordClientSecret,
      ctrConfig: orderCtrKeys(ctrConfig)
    }
  }
}

const orderCtrKeys = (incoming: ChainTrustRatingConfig[]) => {
  const ordered: ChainTrustRatingConfig[] = [];

  for (const eventKey of Object.values(CTREvent)) {
    const found = incoming.find(c => c.key === eventKey.key);
    if (found) {
      ordered.push(found);
    }
  }

  return ordered;
}
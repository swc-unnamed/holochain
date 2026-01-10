import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard';

export const revokeCombineIntegration = command(
  async () => {
    const { locals } = getRequestEvent();
    guard(locals, ['DEVELOPER']);

    // Delete all integration tokens and metadata from SiteConfiguration
    await db.siteConfiguration.deleteMany({
      where: {
        key: {
          in: [
            'INTEGRATION_COMBINE_ACCESS_TOKEN',
            'INTEGRATION_COMBINE_REFRESH_TOKEN',
            'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT',
            'INTEGRATION_COMBINE_SCOPES'
          ]
        }
      }
    });

    return { success: true };
  }
);

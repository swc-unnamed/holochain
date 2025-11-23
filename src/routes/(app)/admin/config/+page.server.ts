import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals }) => {
  guard(locals, ['DEVELOPER', 'TZAR']);

  const config = await db.siteConfiguration.findMany();

  const combineClientId = config.find(c => c.key === 'COMBINE_CLIENT_ID')?.value || '';
  const combineClientSecret = config.find(c => c.key === 'COMBINE_CLIENT_SECRET')?.value || '';
  const globalRequireCombineAuth = config.find(c => c.key === 'GLOBAL_REQUIRE_COMBINE_AUTHENTICATION')?.value === 'true';
  const globalDisableNameVerification = config.find(c => c.key === 'GLOBAL_DISABLE_NAME_VERIFICATION')?.value === 'true';

  return {
    combineClientId,
    combineClientSecret,
    globalRequireCombineAuth,
    globalDisableNameVerification
  }
}
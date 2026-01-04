import { env } from "$env/dynamic/private"
import { db } from "$lib/db/prisma";
import { Cookie } from "$lib/types/cookies.js";
import { getCombineAuthUrl } from "$lib/utils/auth/combine-auth";

export const load = async ({ cookies }) => {
  const authConfig = await getCombineAuthUrl();

  if (!authConfig.url) {
    return { combineAuthEnabled: false };
  }

  cookies.set(Cookie.SESSION, authConfig.state, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
  });

  const siteConfig = await db.siteConfiguration.findUnique({
    where: {
      key: 'GLOBAL_REQUIRE_COMBINE_AUTHENTICATION'
    }
  });

  return {
    combineAuthEnabled: true,
    combineAuthUrl: authConfig.url,
    requireCombineAuth: siteConfig?.value === 'true' || false
  }
}
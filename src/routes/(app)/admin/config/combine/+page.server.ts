import { guard } from '$lib/utils/auth/server-guard';
import { db } from '$lib/db/prisma';
import { getAdminCombineAuthUrl, getMarketAccessToken } from '$lib/utils/auth/combine-admin';
import { allAdminScopes } from '$lib/utils/auth/admin-scopes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, depends }) => {
  guard(locals, ['DEVELOPER']);
  depends('app:admin:config:combine');

  // Fetch integration tokens and metadata from SiteConfiguration
  const configs = await db.siteConfiguration.findMany({
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

  // By calling this, we ensure that the token is refreshed if needed
  await getMarketAccessToken()

  const accessToken = configs.find((c) => c.key === 'INTEGRATION_COMBINE_ACCESS_TOKEN')?.value;
  const refreshToken = configs.find((c) => c.key === 'INTEGRATION_COMBINE_REFRESH_TOKEN')?.value;
  const expiresAtStr = configs.find((c) => c.key === 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT')?.value;
  const scopesStr = configs.find((c) => c.key === 'INTEGRATION_COMBINE_SCOPES')?.value;

  // Determine if integration is connected
  const isConnected = !!(accessToken && refreshToken);

  // Parse expiry date
  let expiresAt: Date | null = null;
  let isExpired = false;
  if (expiresAtStr) {
    expiresAt = new Date(expiresAtStr);
    isExpired = expiresAt < new Date();
  }

  // Parse granted scopes
  let grantedScopes: string[] = [];
  if (scopesStr) {
    try {
      grantedScopes = JSON.parse(scopesStr);
    } catch (e) {
      console.error('Failed to parse granted scopes:', e);
    }
  }

  // Generate OAuth URL and state
  const { url: authUrl, state } = await getAdminCombineAuthUrl();

  // Store state in session cookie for CSRF verification
  if (state) {
    cookies.set('combine_admin_oauth_state', state, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10 // 10 minutes
    });
  }

  return {
    isConnected,
    expiresAt: expiresAt?.toISOString() || null,
    isExpired,
    grantedScopes,
    authUrl,
    requestedScopes: allAdminScopes
  };
};

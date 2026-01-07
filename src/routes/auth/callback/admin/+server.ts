import { db } from '$lib/db/prisma';
import { exchangeAdminCombineCode } from '$lib/utils/auth/combine-admin';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return redirect(307, '/admin/config/combine?error=missing_code');
  }

  if (!state) {
    return redirect(307, '/admin/config/combine?error=missing_state');
  }

  // Verify state matches the one we stored in the session
  const storedState = cookies.get('combine_admin_oauth_state');
  if (!storedState || storedState !== state) {
    return redirect(307, '/admin/config/combine?error=invalid_state');
  }

  // Clear the state cookie
  cookies.delete('combine_admin_oauth_state', { path: '/' });

  try {
    // Exchange code for tokens
    const tokens = await exchangeAdminCombineCode(code);

    // Calculate token expiry timestamp
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();

    // Store tokens in SiteConfiguration
    await Promise.all([
      db.siteConfiguration.upsert({
        where: { key: 'INTEGRATION_COMBINE_ACCESS_TOKEN' },
        create: { key: 'INTEGRATION_COMBINE_ACCESS_TOKEN', value: tokens.accessToken },
        update: { value: tokens.accessToken }
      }),
      db.siteConfiguration.upsert({
        where: { key: 'INTEGRATION_COMBINE_REFRESH_TOKEN' },
        create: { key: 'INTEGRATION_COMBINE_REFRESH_TOKEN', value: tokens.refreshToken },
        update: { value: tokens.refreshToken }
      }),
      db.siteConfiguration.upsert({
        where: { key: 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT' },
        create: { key: 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT', value: expiresAt },
        update: { value: expiresAt }
      }),
      db.siteConfiguration.upsert({
        where: { key: 'INTEGRATION_COMBINE_SCOPES' },
        create: { key: 'INTEGRATION_COMBINE_SCOPES', value: JSON.stringify(tokens.scopes) },
        update: { value: JSON.stringify(tokens.scopes) }
      })
    ]);

    return redirect(307, '/admin/config/combine?success=true');
  } catch (err) {
    console.error('Admin Combine OAuth error:', err);
    const errorMessage = err instanceof Error ? err.message : 'unknown_error';
    return redirect(307, `/admin/config/combine?error=${encodeURIComponent(errorMessage)}`);
  }
};

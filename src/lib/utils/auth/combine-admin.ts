import { env } from '$env/dynamic/private';
import { db } from '$lib/db/prisma';
import { error } from '@sveltejs/kit';
import { nanoid } from '../helpers/shared/nanoid';
import { getAdminScopeStrings } from './admin-scopes';
import { SWCombine } from 'swcombine-sdk';

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string[];
}

interface MarketTokenConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  clientId: string;
  clientSecret: string;
}

interface RefreshedTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate Combine OAuth URL for admin authentication with faction scopes
 */
export async function getAdminCombineAuthUrl() {
  const siteConfig = await db.siteConfiguration.findMany({
    where: {
      key: {
        in: ['COMBINE_CLIENT_ID', 'COMBINE_CLIENT_SECRET']
      }
    }
  });

  if (siteConfig.length < 2) {
    return { url: null, state: null };
  }

  const params = new URLSearchParams();
  const state = nanoid();

  const scopes = getAdminScopeStrings();

  params.append('client_id', siteConfig.find((c) => c.key === 'COMBINE_CLIENT_ID')!.value);
  params.append('response_type', 'code');
  params.append('redirect_uri', `${env.ORIGIN}/auth/callback/admin`);
  params.append('scope', scopes.join(' '));
  params.append('access_type', 'offline');
  // params.append('renew_previously_granted', 'yes');
  params.append('state', state);

  const url = `https://www.swcombine.com/ws/oauth2/auth/?${params.toString()}`;

  return { url: url, state: state };
}

/**
 * Exchange authorization code for admin access tokens
 */
export async function exchangeAdminCombineCode(code: string): Promise<AdminTokens> {
  const siteConfig = await db.siteConfiguration.findMany({
    where: {
      key: {
        in: ['COMBINE_CLIENT_ID', 'COMBINE_CLIENT_SECRET']
      }
    }
  });

  if (siteConfig.length < 2) {
    error(500, { message: 'Combine authentication is not configured properly.' });
  }

  const params = new URLSearchParams();
  params.append('client_id', siteConfig.find((c) => c.key === 'COMBINE_CLIENT_ID')!.value);
  params.append('client_secret', siteConfig.find((c) => c.key === 'COMBINE_CLIENT_SECRET')!.value);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('access_type', 'offline');
  params.append('redirect_uri', `${env.ORIGIN}/auth/callback/admin`);

  const tokenResp = await fetch('https://www.swcombine.com/ws/oauth2/token/', {
    method: 'POST',
    body: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!tokenResp.ok) {
    const errorText = await tokenResp.text();
    console.error('Token exchange failed:', errorText);
    error(500, { message: 'Failed to exchange authorization code for tokens' });
  }

  const tokenData = await tokenResp.json();

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    scopes: tokenData.scope.split(' ')
  };
}

/**
 * Get valid market access token, refreshing if necessary
 *
 * Automatically refreshes token if:
 * - Token is expired
 * - Token expires in less than 5 minutes
 *
 * @throws {Error} if integration not configured or refresh fails
 * @returns Promise<string> - Valid access token
 */
export async function getMarketAccessToken(): Promise<string> {
  // 1. Fetch all required config
  const config = await fetchMarketTokenConfig();

  if (!config) {
    error(500, { message: 'Combine Market integration not configured' });
  }

  // 2. Check if refresh needed
  if (!shouldRefreshToken(config.expiresAt)) {
    console.log('Using existing Combine Market access token');
    return config.accessToken;
  }

  console.log('Refreshing Combine Market access token');

  // 3. Refresh token
  const newTokenData = await refreshMarketAccessToken(
    config.refreshToken,
    config.clientId,
    config.clientSecret
  );

  // 4. Update database
  await saveMarketTokens(newTokenData);

  // 5. Return new token
  return newTokenData.accessToken;
}

async function fetchMarketTokenConfig(): Promise<MarketTokenConfig | null> {
  const configs = await db.siteConfiguration.findMany({
    where: {
      key: {
        in: [
          'INTEGRATION_COMBINE_ACCESS_TOKEN',
          'INTEGRATION_COMBINE_REFRESH_TOKEN',
          'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT',
          'COMBINE_CLIENT_ID',
          'COMBINE_CLIENT_SECRET'
        ]
      }
    }
  });

  const accessToken = configs.find((c) => c.key === 'INTEGRATION_COMBINE_ACCESS_TOKEN')?.value;
  const refreshToken = configs.find((c) => c.key === 'INTEGRATION_COMBINE_REFRESH_TOKEN')?.value;
  const expiresAt = configs.find((c) => c.key === 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT')?.value;
  const clientId = configs.find((c) => c.key === 'COMBINE_CLIENT_ID')?.value;
  const clientSecret = configs.find((c) => c.key === 'COMBINE_CLIENT_SECRET')?.value;

  if (!accessToken || !refreshToken || !expiresAt || !clientId || !clientSecret) {
    return null;
  }

  return { accessToken, refreshToken, expiresAt, clientId, clientSecret };
}

function shouldRefreshToken(expiresAtStr: string): boolean {
  try {
    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const msUntilExpiry = expiresAt.getTime() - now.getTime();

    console.log(`Token expires at ${expiresAt.toISOString()}, which is in ${msUntilExpiry} ms`);

    if (msUntilExpiry <= 300_000) {
      console.log('Token is expired or about to expire, needs refresh');
      return true
    } else {
      console.log('Token is still valid, no refresh needed');
      return false
    }
  } catch {
    // Invalid date format - treat as expired
    console.warn('Invalid expiresAt format:', expiresAtStr);
    return true;
  }
}

async function refreshMarketAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<RefreshedTokenData> {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const response = await fetch('https://www.swcombine.com/ws/oauth2/token/', {
    method: 'POST',
    body: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', errorText);

    if (response.status === 401 || response.status === 400) {
      error(401, {
        message:
          'Combine Market refresh token expired. Please re-authenticate in Admin > Config > Combine.'
      });
    }

    error(502, {
      message: `Failed to refresh Combine access token: ${response.status} ${errorText}`
    });
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}

/**
 * Save the tokens in the database
 */
async function saveMarketTokens(tokenData: RefreshedTokenData): Promise<void> {
  const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();

  const updates = [
    db.siteConfiguration.upsert({
      where: { key: 'INTEGRATION_COMBINE_ACCESS_TOKEN' },
      create: { key: 'INTEGRATION_COMBINE_ACCESS_TOKEN', value: tokenData.accessToken },
      update: { value: tokenData.accessToken }
    }),
    db.siteConfiguration.upsert({
      where: { key: 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT' },
      create: { key: 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT', value: expiresAt },
      update: { value: expiresAt }
    })
  ];

  // Only update refresh token if provided (some OAuth servers don't always return new one)
  if (tokenData.refreshToken) {
    updates.push(
      db.siteConfiguration.upsert({
        where: { key: 'INTEGRATION_COMBINE_REFRESH_TOKEN' },
        create: { key: 'INTEGRATION_COMBINE_REFRESH_TOKEN', value: tokenData.refreshToken },
        update: { value: tokenData.refreshToken }
      })
    );
  }

  await Promise.all(updates);
}

/**
 * Get an authenticated admin instance of the swcombine-sdk client. 
 * This client is authenticated with the Combine Integration account / user.
 */
export async function getAdminCombineClient(): Promise<SWCombine | null> {
  try {
    const token = await getMarketAccessToken();
    if (!token) {
      console.error('No valid market access token available for admin client');
      return null;
    }

    const client = new SWCombine({
      clientId: '',
      clientSecret: '',
      token: token
    });

    return client;

  } catch (err) {
    console.error('Failed to create SWCombine client for admin:', err);
    return null;
  }
}
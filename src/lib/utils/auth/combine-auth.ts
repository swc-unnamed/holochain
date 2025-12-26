import { env } from "$env/dynamic/private";
import { db } from "$lib/db/prisma";
import { error, redirect } from "@sveltejs/kit";
import { nanoid } from "../helpers/shared/nanoid";
import type { AuthenticatedCharacter, Character } from "$lib/types/combine/character";

export async function getCombineAuthUrl() {
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

  params.append("client_id", siteConfig.find(c => c.key === 'COMBINE_CLIENT_ID')!.value);
  params.append("response_type", "code");
  params.append("redirect_uri", `${env.ORIGIN}/auth/callback`);
  params.append("scope", "character_read");
  params.append("access_type", "offline");
  params.append("renew_previously_granted", "yes");
  params.append("state", state);

  const url = `https://www.swcombine.com/ws/oauth2/auth/?${params.toString()}`;

  return { url: url, state: state };
}

export async function exchangeCombineCode(code: string): Promise<AuthenticatedCharacter> {
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
  params.append('client_id', siteConfig.find(c => c.key === 'COMBINE_CLIENT_ID')!.value);
  params.append('client_secret', siteConfig.find(c => c.key === 'COMBINE_CLIENT_SECRET')!.value);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('access_type', 'offline');
  params.append('redirect_uri', `${env.ORIGIN}/auth/callback`);

  const tokenResp = await fetch('https://www.swcombine.com/ws/oauth2/token/', {
    method: 'POST',
    body: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!tokenResp.ok) {
    redirect(307, `/auth/login?error=oauth_error`);
  }

  const tokenData = await tokenResp.json();

  const characterResp = await fetch('https://www.swcombine.com/ws/v2.0/character', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `OAuth ${tokenData.access_token}`
    }
  });
  if (!characterResp.ok) {
    redirect(307, `/auth/login?error=oauth_error`);
  }
  const characterData = (await characterResp.json()) as Character;

  return {
    character: characterData,
    tokens: {
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: tokenData.expires_in,
      refreshToken: tokenData.refresh_token,
      scopes: tokenData.scope.split(' ')
    }
  }
}

export async function upsertUserAccount(authenticatedCharacter: AuthenticatedCharacter) {
  const user = await db.user.upsert({
    where: {
      combineId: authenticatedCharacter.character.swcapi.character.uid,
    },
    create: {
      name: authenticatedCharacter.character.swcapi.character.name,
      combineId: authenticatedCharacter.character.swcapi.character.uid,
      displayName: authenticatedCharacter.character.swcapi.character.name,
      anonid: nanoid(),
      avatarUrl: authenticatedCharacter.character.swcapi.character.image,
      combineScopes: authenticatedCharacter.tokens.scopes,
      role: 'PATRON',
      preferences: {
        createMany: {
          data: [
            { key: 'GLOBAL_ANONYMOUS_MODE', value: 'false' },
            { key: 'GLOBAL_ENABLE_NOTIFICATIONS', value: 'false' },
            { key: 'GLOBAL_THEME_MODE', value: 'dark' },
          ]
        }
      },
      ctr: 50,
      ctrLogs: {
        create: {
          delta: 50,
          reason: 'Initial account creation with Combine authentication',
        }
      }
    },
    update: {
      name: authenticatedCharacter.character.swcapi.character.name,
      avatarUrl: authenticatedCharacter.character.swcapi.character.image,
      combineScopes: authenticatedCharacter.tokens.scopes,
    }
  });

  return user;
}
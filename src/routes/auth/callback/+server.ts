import { env } from '$env/dynamic/private';
import { Cookie } from '$lib/types/cookies.js';
import { exchangeCombineCode, upsertUserAccount } from '$lib/utils/auth/combine-auth.js';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const GET = async ({ cookies, url }) => {
  const code = url.searchParams.get('code') as string;

  const authenticatedCharacter = await exchangeCombineCode(code);

  const user = await upsertUserAccount(authenticatedCharacter);

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
    expiresIn: '30d'
  });

  cookies.set(Cookie.SESSION, token, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  cookies.set(Cookie.COMBINE_TOKEN, authenticatedCharacter.tokens.accessToken, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    maxAge: authenticatedCharacter.tokens.accessTokenExpiresAt
  });

  cookies.set(Cookie.COMBINE_REFRESH_TOKEN, authenticatedCharacter.tokens.refreshToken, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    // Set refresh token to expire in 14 days
    maxAge: 60 * 60 * 24 * 14
  });

  return redirect(307, '/');
}
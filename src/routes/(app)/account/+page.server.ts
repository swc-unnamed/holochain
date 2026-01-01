import { env } from '$env/dynamic/private';
import { db } from '$lib/db/prisma'
import { error } from '@sveltejs/kit';

export const load = async ({ locals, depends }) => {
  depends('app:account');
  const account = await db.user.findUnique({
    where: { id: locals.user.id },
    include: {
      preferences: true,
    },
  });

  if (!account) {
    throw error(404, 'Account not found');
  }

  let discordOAuthUrl: string | null = null;

  const config = await db.siteConfiguration.findUnique({
    where: {
      key: 'DISCORD_CLIENT_ID',
    }
  });

  if (config) {
    const urlBuilder = new URL('https://discord.com/api/oauth2/authorize');
    urlBuilder.searchParams.set('client_id', config.value);
    urlBuilder.searchParams.set('redirect_uri', `${env.ORIGIN}/auth/callback/discord`);
    urlBuilder.searchParams.set('response_type', 'code');
    urlBuilder.searchParams.set('scope', 'identify');

    discordOAuthUrl = urlBuilder.toString();

    if (!config.value || config.value === '') {
      discordOAuthUrl = null;
    }
  }



  return {
    account: account,
    discordOAuthUrl: discordOAuthUrl
  };
}
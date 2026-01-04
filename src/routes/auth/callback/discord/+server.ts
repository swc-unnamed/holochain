import { env } from "$env/dynamic/private";
import { db } from "$lib/db/prisma";
import { getCtrConfig } from "$lib/db/shared/get-ctr-config.js";
import { redirect } from "@sveltejs/kit";


export const GET = async ({ locals, url }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Bad Request: Missing code parameter', { status: 400 });
  }

  const config = await db.siteConfiguration.findMany({
    where: {
      key: {
        in: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET']
      }
    }
  });

  if (config.length < 2) {
    return new Response('Internal Server Error: Missing Discord configuration', { status: 500 });
  }

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.find(c => c.key === 'DISCORD_CLIENT_ID')!.value,
      client_secret: config.find(c => c.key === 'DISCORD_CLIENT_SECRET')!.value,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${env.ORIGIN}/auth/callback/discord`,
    }),
  })

  const data = await response.json();

  if (!data.access_token) {
    return new Response('Unauthorized: Invalid code', { status: 401 });
  }

  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });

  const discordUser = await userResponse.json();

  const ctrConfig = await getCtrConfig('ACCOUNT_DISCORD_LINKED');
  if (ctrConfig && ctrConfig.points !== 0) {
    await db.user.update({
      where: {
        id: locals.user.id,
      },
      data: {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        ctr: { increment: 10 },
        ctrLogs: {
          create: {
            reason: 'Linked Discord account',
            delta: 10,
            event: 'ACCOUNT_DISCORD_LINKED',
          }
        }
      },
    });
  } else {
    await db.user.update({
      where: {
        id: locals.user.id,
      },
      data: {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
      },
    });
  }

  redirect(307, '/account')
}
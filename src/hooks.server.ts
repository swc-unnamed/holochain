import { db } from "$lib/db/prisma";
import { getLoggedInUser } from "$lib/utils/auth/get-logged-in-user";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { getPostHogClient } from '$lib/server/posthog/posthog';

const authHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === '/auth/callback') return resolve(event);
  if (event.url.pathname === '/auth/login') return resolve(event);
  if (event.url.pathname.startsWith('/api')) return resolve(event);

  const session = event.cookies.get('um_session');
  if (!session) throw redirect(303, '/auth/login');

  const currentUser = await getLoggedInUser(session);

  if (!currentUser) {
    throw redirect(303, '/auth/login');
  }

  event.locals.user = currentUser;

  const posthog = getPostHogClient();

  posthog.identify({
    distinctId: currentUser.id,
    properties: {
      $set: {
        name: currentUser.name,
        ctr: currentUser.ctr,
      }
    }
  });
  return resolve(event);
}

const apiAuthHandle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/api')) return resolve(event);
  if (event.url.pathname === '/api/inngest') return resolve(event);
  if (event.url.pathname === '/api/health') return resolve(event);
  if (event.url.pathname.startsWith('/api/ph')) return resolve(event);

  const start = Date.now();

  const apiKey = event.request.headers.get('x-api-key');

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const client = await db.apiClient.findUniqueOrThrow({
    where: {
      apiKey: apiKey
    }
  });

  if (client.status !== 'APPROVED') {
    return new Response(JSON.stringify({ error: 'API Client is not approved' }), { status: 403 });
  }

  event.locals.apiClient = {
    id: client.id,
    scopes: client.scopes
  }

  const resp = await resolve(event);

  const duration = Date.now() - start;

  await db.apiClient.update({
    where: {
      id: client.id
    },
    data: {
      lastUsedAt: new Date(),
      logs: {
        create: {
          endpoint: event.url.pathname,
          method: event.request.method,
          latencyMs: duration,
          status: resp.status,
          statusText: resp.statusText,
          payload: event.request.body ? await event.request.json().catch(() => null) : null
        }
      }
    }
  });

  return resp;
}

export const handle = sequence(authHandle, apiAuthHandle);
import { getLoggedInUser } from "$lib/utils/auth/get-logged-in-user";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const authHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api')) return resolve(event);
  if (event.url.pathname.startsWith('/auth')) return resolve(event);

  const session = event.cookies.get('um_session');
  if (!session) throw redirect(303, '/auth/login');

  const currentUser = await getLoggedInUser(session);

  if (!currentUser) throw redirect(303, '/auth/login');

  event.locals.user = currentUser;

  return resolve(event);
}

export const handle = sequence(authHandle);
import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";


export const listClients = query(async () => {
  const { locals } = getRequestEvent();

  guard(locals, ['DEVELOPER']);

  const clients = await db.apiClient.findMany();

  return clients
})
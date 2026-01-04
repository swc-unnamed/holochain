import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { createClientSchema } from "./create-client.schema";
import { nanoid } from '$lib/utils/helpers/shared/nanoid';
import { listClients } from "./list-clients.remote";


export const createClient = command(createClientSchema, async (data) => {
  const { locals } = getRequestEvent();

  const apiClient = await db.apiClient.create({
    data: {
      name: data.name,
      description: data.description,
      status: 'APPROVED',
      ownerId: locals.user.id,
      scopes: ['MARKET_READ_CONTRACTS', 'MARKET_LIST_CONTRACTS', 'MARKET_CREATE_CONTRACTS', 'HOLOCHAIN_DATABASE_READ', 'HOLOCHAIN_TRANSACTIONS_READ', 'HOLOCHAIN_TRANSACTIONS_WRITE'],
      apiKey: nanoid(16)
    }
  });

  await listClients().refresh();

  return apiClient;
})
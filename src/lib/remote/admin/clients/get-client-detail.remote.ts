import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { getClientDetailSchema } from "./get-client-detail.schema";


export const getClientDetail = query(getClientDetailSchema, async (params) => {
  const { locals } = getRequestEvent();
  guard(locals, ['DEVELOPER']);

  return await db.apiClient.findUniqueOrThrow({
    where: {
      id: params.id
    },
    omit: {
      apiKey: true
    },
    include: {
      logs: true
    }
  })
})
import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { updateCtrConfigSchema } from "./update-ctr-config.schema";

export const updateCtrConfig = command(updateCtrConfigSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['DEVELOPER', 'TZAR']);

  for (const item of data.data) {
    await db.chainTrustRatingConfig.upsert({
      where: { key: item.key },
      create: {
        key: item.key,
        points: item.points,
        reason: item.reason
      },
      update: {
        points: item.points,
        reason: item.reason
      }
    })
  }
})
import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { nanoid } from "$lib/utils/helpers/shared/nanoid";

export const resetAnonId = command(async () => {
  try {
    const { locals } = getRequestEvent();
    await db.user.update({
      where: {
        id: locals.user.id
      },
      data: {
        anonid: nanoid()
      }
    });

    return {
      success: true
    }
  } catch {
    return {
      success: false
    }
  }
})
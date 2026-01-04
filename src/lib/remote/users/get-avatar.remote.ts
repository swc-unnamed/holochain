import { query } from "$app/server";
import { db } from "$lib/db/prisma";
import { z } from 'zod/v4';
import { rings } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

const schema = z.object({
  id: z.string()
});

export const getUserAvatar = query(schema, async ({ id }) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        avatarUrl: true,
        anonid: true,
        preferences: {
          where: { key: 'GLOBAL_ANONYMOUS_MODE' }
        }
      }
    });

    if (!user) {
      return null;
    }

    if (user.preferences[0].value === 'true') {
      const avatar = createAvatar(rings, {
        seed: user.anonid,
      });

      return avatar.toDataUri();
    }

    if (!user.avatarUrl) {
      const avatar = createAvatar(rings, {
        seed: user.id,
      });

      return avatar.toDataUri();
    }

    return user.avatarUrl;
  } catch {
    return null;
  }
})
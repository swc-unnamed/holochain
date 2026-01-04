import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

const schema = z.object({
  userId: z.string(),
  reason: z.string(),
  bannedUntil: z.string().nullish(),
});

export const banUser = command(schema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['DEVELOPER', 'TZAR']);

  const user = await db.user.findUnique({
    where: {
      id: data.userId
    }
  });

  if (!user) {
    return error(404, 'User not found');
  }

  await db.user.update({
    where: {
      id: data.userId
    },
    data: {
      banned: true,
      bannedReason: data.reason,
      bannedUntil: data.bannedUntil ? new Date(data.bannedUntil) : null,
      bannedById: locals.user.id
    }
  });

  return {
    success: true
  }
})
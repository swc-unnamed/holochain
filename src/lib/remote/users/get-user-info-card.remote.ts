import { query } from "$app/server";
import { db } from "$lib/db/prisma";
import z from "zod";


export const getUserInfoCard = query(z.cuid2(), async (id) => {
  const user = await db.user.findUniqueOrThrow({
    where: { id: id },
    select: {
      displayName: true,
      ctr: true,
      createdAt: true,
      avatarUrl: true,
      role: true
    }
  });

  return user;
})
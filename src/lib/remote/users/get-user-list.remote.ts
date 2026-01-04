import { query } from "$app/server";
import { db } from "$lib/db/prisma";

export const getUserList = query(async () => {
  const users = await db.user.findMany({
    where: {
      banned: false
    },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      approvedMiddle: true
    },
    orderBy: {
      displayName: 'asc'
    }
  });

  return users;
})
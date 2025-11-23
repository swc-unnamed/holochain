import { env } from "$env/dynamic/private";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

export async function getLoggedInUser(token: string): Promise<User | null> {

  try {

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      omit: { passwordHash: true },
      include: {
        preferences: true,
      }
    });

    if (!user) {
      throw error(404, "User not found");
    }

    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
      combineId: user.combineId || undefined,
      combineScopes: user.combineScopes || undefined,
      discordId: user.discordId || undefined,
      discordUsername: user.discordUsername || undefined,
      preferences: user.preferences,
      anonid: user.anonid,
    }

  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }


}
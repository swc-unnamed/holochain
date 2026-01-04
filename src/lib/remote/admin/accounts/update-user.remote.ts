import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { updateUserSchema } from "./update-user.schema";

export const updateUser = command(updateUserSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ["DEVELOPER", "TZAR"]);

  try {
    await db.user.update({
      where: { id: data.userId },
      data: {
        role: data.role,
        name: data.name,
        displayName: data.displayName,
        approvedMiddle: data.approvedMiddle,
      }
    })
  } catch (err) {
    console.error('Error updating user:', err);
    return { success: false, error: 'Failed to update user' };
  }
});
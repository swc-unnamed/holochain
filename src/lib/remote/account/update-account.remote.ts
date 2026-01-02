import { command, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { updateAccountPreferenceSchema, updateAccountSchema } from "./update-account.schema";
import { db } from "$lib/db/prisma";

export const updateAccount = command(updateAccountSchema, async (data) => {
  const { locals } = getRequestEvent();
  console.log('Updating account with data:', data);
  try {
    await db.user.update({
      where: { id: locals.user.id },
      data: {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl
      }
    });

    return { success: true, message: 'Account updated successfully' };
  } catch (e) {
    console.error('Failed to update account:', e);
    return error(400, 'Failed to update account');
  }
});

export const updateAccountPreference = command(updateAccountPreferenceSchema, async (data) => {
  const { locals } = getRequestEvent();
  try {
    await db.userPreference.upsert({
      where: {
        user_key: {
          userId: locals.user.id,
          key: data.key
        }
      },
      create: {
        key: data.key,
        value: data.value,
        user: {
          connect: { id: locals.user.id }
        }
      },
      update: {
        value: data.value,
      }
    });
    return { success: true, message: 'Preference updated' };
  } catch (e) {
    console.error('Failed to update preference:', e);
    return error(400, 'Failed to update preference');
  }
})
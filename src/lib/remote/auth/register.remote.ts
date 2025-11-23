import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db/prisma';
import { hash } from '$lib/utils/encryption/hash';
import { error } from '@sveltejs/kit';
import { registerSchema } from './register.schema';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { nanoid } from '$lib/utils/helpers/shared/nanoid';
import { getDefaultPreferences } from '$lib/types/user-preference-detail';
import type { UserPreferenceKey } from '$lib/generated/prisma/enums';
import { newUserEventTask } from '../../trigger/events/user/new-user';
import "dotenv/config";

export const registerAccount = command(registerSchema, async (data) => {
  const { cookies } = getRequestEvent();
  if (data.password !== data.passwordConfirm) {
    return error(400, 'Your passwords do not match, check that and try again.')
  }
  const doesUserExist = await db.user.findUnique({
    where: { name: data.name }
  });

  if (doesUserExist) {
    console.log("User already exists, not able to register them");
    return error(400, 'Invalid registration data')
  }

  const encryptedPassword = hash(data.password);

  const defaultPreferences = getDefaultPreferences();

  const user = await db.user.create({
    data: {
      name: data.name,
      displayName: data.name,
      anonid: nanoid(),
      passwordHash: encryptedPassword,
      karma: 10,
      karmaLogs: {
        create: {
          delta: 10,
          reason: 'Registered a new Account',
        }
      },
      preferences: {
        createMany: {
          data: Object.entries(defaultPreferences).map((p) => ({
            key: p[0] as UserPreferenceKey,
            value: p[1]
          }))
        }
      }
    }
  });

  const token = jwt.sign(JSON.stringify({ id: user.id }), env.JWT_SECRET)

  cookies.set('um_session', token, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV !== 'development'
  });

  await newUserEventTask.trigger({ userId: user.id });
  return { success: true, message: 'Registration successful', redirect: '/account' }
})
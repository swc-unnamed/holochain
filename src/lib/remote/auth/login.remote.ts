import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { loginSchema } from "./login.schema";
import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";
import { hash } from "$lib/utils/encryption/hash";

export const login = command(loginSchema, async (data) => {
  const { name, password } = data;

  const user = await db.user.findUnique({
    where: { name }
  });

  if (!user) {
    return error(400, 'Invalid login credentials');
  }

  const encryptedPassword = hash(password);

  if (user.passwordHash !== encryptedPassword) {
    return error(400, 'Invalid login credentials');
  }

  const { cookies } = getRequestEvent();
  const token = jwt.sign(JSON.stringify({ id: user.id }), env.JWT_SECRET);

  cookies.set('um_session', token, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV !== 'development'
  })
})
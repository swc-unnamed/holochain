import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { loginSchema } from "./login.schema";
import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";

export const login = command(loginSchema, async (data) => {
  const { name, password } = data;

  if (name !== 'um_admin') {
    throw error(400, 'Invalid login credentials');
  }

  const user = await db.user.findUnique({
    where: { name }
  });

  if (!user) {
    return error(400, 'Invalid login credentials');
  }

  if (password !== env.SUPER_ADMIN_PASSWORD) {
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
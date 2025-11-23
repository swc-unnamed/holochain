import { command, getRequestEvent } from "$app/server";

export const logout = command(async () => {
  const { cookies } = getRequestEvent();

  cookies.delete("um_session", {
    path: "/",
  });
})
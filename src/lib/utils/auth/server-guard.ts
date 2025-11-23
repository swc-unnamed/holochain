import type { AppRole } from "$lib/generated/prisma/enums";
import { error } from "@sveltejs/kit";

export function guard(locals: App.Locals, requiredRoles: AppRole[], message?: string) {
  const userRole = locals.user.role;
  if (userRole === 'DEVELOPER' || userRole === 'TZAR') return true;
  if (!requiredRoles.includes(userRole)) {
    throw error(403, message || "Access denied");
  }

  return true;
}
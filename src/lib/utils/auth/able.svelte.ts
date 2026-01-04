import type { AppRole } from "$lib/generated/prisma/enums";
import { page } from "$app/state";

export const able = (roles?: AppRole | AppRole[]): boolean => {
  if (!roles) return true;

  const userRole = page.data.user.role;

  // Admin roles have access to everything
  if (userRole === "TZAR" || userRole === "DEVELOPER") return true;

  // Check if user role matches required role(s)
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return requiredRoles.includes(userRole);
};
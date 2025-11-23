import type { Pathname } from "$app/types";
import type { AppRole } from "$lib/generated/prisma/enums";

export type NavigationRoute = {
  title: string;
  icon?: string;
  role?: AppRole | AppRole[];
  flag?: string;
  items?: Array<NavigationRoute & { url: Pathname }>;
}
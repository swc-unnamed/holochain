import type { Route } from "$lib/types/general/route.type";

export const getOrganizationRoutes = (slug: string): Route[] => [
  {
    title: "Dashboard",
    href: `/${slug}/dashboard`,
    icon: ""
  },
  {
    title: "Analytics",
    href: `/${slug}/analytics`,
    icon: ""
  },
  {
    title: "Hubs",
    href: `/${slug}/hubs`,
    icon: ""
  },
  {
    title: "Marketplace",
    href: `/${slug}/market`,
    icon: ""
  },
  {
    title: "Patrons",
    href: `/${slug}/patrons`,
    icon: ""
  },
  {
    title: "Stock Management",
    href: `/${slug}/stocks`,
    icon: ""
  }
]
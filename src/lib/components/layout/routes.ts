import type { NavigationRoute } from "$lib/types/general/navigation-route.type";

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  // {
  //   title: "Main Sector",
  //   icon: "",
  //   items: [
  //     {
  //       title: "Home",
  //       url: "/home"
  //     }
  //   ]
  // },
  {
    title: "Auction House",
    icon: "lucide:gavel",
    items: [
      {
        title: "Auctions",
        url: "/auction-house/auctions"
      },
      {
        title: "Lot Profile",
        url: "/auction-house/lots"
      },
      {
        title: "Create a Lot",
        url: "/auction-house/lots/create",
      },
      {
        title: "Pending Lots",
        url: "/auction-house/lots/pending",
        role: ['AUCTIONEER']
      },
      {
        title: "Create a Auction",
        url: "/auction-house/auctions/create",
        role: ['AUCTIONEER']
      },
      {
        title: "Auction Archive",
        url: "/auction-house/auctions/archive",
      },

      {
        title: "Configuration",
        url: "/auction-house/config",
        role: ['DEVELOPER', 'TZAR']
      }
    ]
  },
  {
    title: 'Docs',
    icon: 'mdi:book-open-page-variant',
    items: [
      {
        title: 'Documentation',
        url: '/docs'
      }
    ]
  },
  // {
  //   title: "Marketplace",
  //   icon: "",
  //   flag: "wip",
  //   items: [
  //     {
  //       title: "Overview",
  //       url: "/market"
  //     },
  //     {
  //       title: "Trade Hubs",
  //       url: "/market"
  //     },
  //     {
  //       title: "My Trade Hubs",
  //       url: "/market"
  //     },
  //     {
  //       title: "My Orders",
  //       url: "/market"
  //     },
  //     {
  //       title: "My Transactions",
  //       url: "/market"
  //     },
  //     {
  //       title: "Pending Reviews",
  //       url: "/market"
  //     },
  //     {
  //       title: "Pending Purchases",
  //       url: "/market"
  //     },
  //     {
  //       title: "Watchlist",
  //       url: "/market"
  //     },
  //     {
  //       title: "Asset Stock",
  //       url: "/market"
  //     }
  //   ]
  // },
  {
    title: "Holochain",
    icon: "mdi:database",
    items: [
      {
        title: "Transactions",
        url: "/holochain/transactions"
      },
      {
        title: "Database",
        url: "/holochain/database"
      }
    ]
  },
  {
    title: "Administration",
    icon: "lucide:settings-2",
    role: ['DEVELOPER', 'TZAR'],
    items: [
      {
        title: "Overview",
        url: "/admin",
        role: ['DEVELOPER', 'TZAR']
      },
      {
        title: "API Clients",
        url: "/admin/clients",
        role: ['DEVELOPER', 'TZAR']
      },
      {
        title: "Account Management",
        url: "/admin/accounts",
        role: ['DEVELOPER', 'TZAR']
      },
      {
        title: "Config",
        url: "/admin/config",
        role: ['DEVELOPER', 'TZAR']
      }
    ]
  }
]

// export const getOrganizationNavigationRoutes = ({ name, slug }: { name: string; slug: string }): NavigationRoute[] => {
//   return [
//     {
//       title: name,
//       icon: "",
//       items: [
//         {
//           title: "Overview",
//           url: `/o/${slug}/organization/overview`
//         },
//         {
//           title: "Members",
//           url: `/o/${slug}/organization/members`
//         },
//         {
//           title: "Assets",
//           url: `/o/${slug}/organization/assets`
//         },
//         {
//           title: "Invitations",
//           url: `/o/${slug}/organization/invitations`
//         },
//         {
//           title: "Settings",
//           url: `/o/${slug}/organization/settings`
//         }
//       ]
//     }
//   ]
// }
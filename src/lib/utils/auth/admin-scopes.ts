import { FactionScopes, FactionInventoryScopes } from 'swcombine-sdk';

export interface ScopeDefinition {
  scope: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Faction management scopes for admin automation
 */
export const factionManagementScopes: ScopeDefinition[] = [
  {
    scope: FactionScopes.READ,
    name: 'Read Faction Info',
    description: 'Access basic faction information, details, and settings',
    icon: 'lucide:shield'
  },
  {
    scope: FactionScopes.MEMBERS,
    name: 'Read Members',
    description: 'View faction member list and member details',
    icon: 'lucide:users'
  },
  {
    scope: FactionScopes.STOCKS,
    name: 'Read Stocks',
    description: 'Access faction stock holdings and market positions',
    icon: 'lucide:trending-up'
  },
  {
    scope: FactionScopes.CREDITS_READ,
    name: 'Read Credits',
    description: 'View faction credit balance and transaction history',
    icon: 'lucide:coins'
  },
  {
    scope: FactionScopes.CREDITS_WRITE,
    name: 'Transfer Credits',
    description: 'Transfer credits on behalf of the faction',
    icon: 'lucide:arrow-right-left'
  },
  {
    scope: FactionScopes.BUDGETS_READ,
    name: 'Read Budgets',
    description: 'View faction budget allocations and spending',
    icon: 'lucide:wallet'
  },
  {
    scope: FactionScopes.BUDGETS_WRITE,
    name: 'Manage Budgets',
    description: 'Create and modify faction budget allocations',
    icon: 'lucide:file-edit'
  },
  {
    scope: FactionScopes.DATACARDS_READ,
    name: 'Read Datacards',
    description: 'Access faction datacard library and blueprints',
    icon: 'lucide:book-open'
  },
  {
    scope: FactionScopes.DATACARDS_WRITE,
    name: 'Manage Datacards',
    description: 'Add, remove, or modify faction datacards',
    icon: 'lucide:book-plus'
  }
];

/**
 * Faction inventory scopes for admin automation
 */
export const factionInventoryScopes: ScopeDefinition[] = [
  {
    scope: FactionInventoryScopes.OVERVIEW,
    name: 'Inventory Overview',
    description: 'View summary of all faction-owned assets',
    icon: 'lucide:layout-dashboard'
  },
  {
    scope: FactionInventoryScopes.SHIPS.ALL,
    name: 'Manage Ships',
    description: 'Full access to faction ships (read, rename, assign, tags)',
    icon: 'lucide:plane'
  },
  {
    scope: FactionInventoryScopes.VEHICLES.ALL,
    name: 'Manage Vehicles',
    description: 'Full access to faction vehicles (read, rename, assign, tags)',
    icon: 'lucide:truck'
  },
  {
    scope: FactionInventoryScopes.STATIONS.ALL,
    name: 'Manage Stations',
    description: 'Full access to faction stations (read, rename, assign, tags)',
    icon: 'lucide:building'
  },
  {
    scope: FactionInventoryScopes.CITIES.ALL,
    name: 'Manage Cities',
    description: 'Full access to faction cities (read, rename, assign, tags)',
    icon: 'lucide:landmark'
  },
  {
    scope: FactionInventoryScopes.FACILITIES.ALL,
    name: 'Manage Facilities',
    description: 'Full access to faction facilities (read, rename, assign, tags)',
    icon: 'lucide:factory'
  },
  {
    scope: FactionInventoryScopes.ITEMS.ALL,
    name: 'Manage Items',
    description: 'Full access to faction items (read, rename, assign, tags)',
    icon: 'lucide:package'
  },
  {
    scope: FactionInventoryScopes.NPCS.ALL,
    name: 'Manage NPCs',
    description: 'Full access to faction NPCs (read, assign, makeover, tags)',
    icon: 'lucide:user-cog'
  },
  {
    scope: FactionInventoryScopes.DROIDS.ALL,
    name: 'Manage Droids',
    description: 'Full access to faction droids (read, rename, assign, tags)',
    icon: 'lucide:bot'
  },
  {
    scope: FactionInventoryScopes.MATERIALS.ALL,
    name: 'Manage Materials',
    description: 'Full access to faction materials (read, rename, tags)',
    icon: 'lucide:box'
  },
  {
    scope: FactionInventoryScopes.CREATURES.ALL,
    name: 'Manage Creatures',
    description: 'Full access to faction creatures (read, rename, assign, tags)',
    icon: 'lucide:paw-print'
  }
];

/**
 * All requested scopes combined
 */
export const allAdminScopes: ScopeDefinition[] = [
  ...factionManagementScopes,
  ...factionInventoryScopes
];

/**
 * Get array of scope strings for OAuth request
 */
export function getAdminScopeStrings(): string[] {
  return allAdminScopes.map((s) => s.scope);
}

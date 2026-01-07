import { SiteConfigurationKey } from "$lib/generated/prisma/enums";

interface SiteConfigDetail {
  key: SiteConfigurationKey;
  name: string;
  description: string;
  default: string;
}

export const SiteConfig: Record<SiteConfigurationKey, SiteConfigDetail> = {
  COMBINE_CLIENT_ID: {
    key: 'COMBINE_CLIENT_ID',
    name: "Combine Client ID",
    description: "The client ID used for authentication with the Combine service.",
    default: ""
  },
  COMBINE_CLIENT_SECRET: {
    key: 'COMBINE_CLIENT_SECRET',
    name: "Combine Client Secret",
    description: "The client secret used for authentication with the Combine service.",
    default: ""
  },
  DISCORD_CLIENT_ID: {
    key: 'DISCORD_CLIENT_ID',
    name: "Discord Client ID",
    description: "The client ID used for Discord OAuth authentication.",
    default: ""
  },
  DISCORD_CLIENT_SECRET: {
    key: 'DISCORD_CLIENT_SECRET',
    name: "Discord Client Secret",
    description: "The client secret used for Discord OAuth authentication.",
    default: ""
  },
  INTEGRATION_COMBINE_ACCESS_TOKEN: {
    key: 'INTEGRATION_COMBINE_ACCESS_TOKEN',
    name: "Combine Integration - Access Token",
    description: "OAuth access token for Combine admin integration. Managed automatically.",
    default: ""
  },
  INTEGRATION_COMBINE_REFRESH_TOKEN: {
    key: 'INTEGRATION_COMBINE_REFRESH_TOKEN',
    name: "Combine Integration - Refresh Token",
    description: "OAuth refresh token for Combine admin integration. Managed automatically.",
    default: ""
  },
  INTEGRATION_COMBINE_TOKEN_EXPIRES_AT: {
    key: 'INTEGRATION_COMBINE_TOKEN_EXPIRES_AT',
    name: "Combine Integration - Token Expiry",
    description: "ISO timestamp when the Combine access token expires. Managed automatically.",
    default: ""
  },
  INTEGRATION_COMBINE_SCOPES: {
    key: 'INTEGRATION_COMBINE_SCOPES',
    name: "Combine Integration - Granted Scopes",
    description: "JSON array of scopes granted to the Combine admin integration. Managed automatically.",
    default: ""
  },
  GLOBAL_REQUIRE_COMBINE_AUTHENTICATION: {
    key: 'GLOBAL_REQUIRE_COMBINE_AUTHENTICATION',
    name: "Global - Require Combine Authentication",
    description: "If enabled, all users must authenticate via Combine to access the site.",
    default: "false"
  },
  GLOBAL_DISABLE_NAME_VERIFICATION: {
    key: 'GLOBAL_DISABLE_NAME_VERIFICATION',
    name: "Global - Disable Name Verification",
    description: "If enabled, name verification checks are disabled for all users. Meaning users can register any name without the system verifying its authenticity against the Combine.",
    default: "false"
  }
}
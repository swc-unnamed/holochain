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
import { command, getRequestEvent } from "$app/server";
import { guard } from "$lib/utils/auth/server-guard";
import { db } from "$lib/db/prisma";
import { updateAdminConfigSchema } from "./update-config.schema";
import type { SiteConfigurationKey } from "$lib/generated/prisma/enums";

export const updateAdminConfig = command(updateAdminConfigSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['DEVELOPER', 'TZAR']);

  const configUpdates: Record<string, string> = {
    'COMBINE_CLIENT_ID': data.combineClientId || '',
    'COMBINE_CLIENT_SECRET': data.combineClientSecret || '',
    'DISCORD_CLIENT_ID': data.discordClientId || '',
    'DISCORD_CLIENT_SECRET': data.discordClientSecret || ''
  };

  const upserts = Object.entries(configUpdates).map(([key, value]) =>
    db.siteConfiguration.upsert({
      where: { key: key as SiteConfigurationKey },
      create: { key: key as SiteConfigurationKey, value },
      update: { value }
    })
  );

  await Promise.all(upserts);

  return { success: true };
})
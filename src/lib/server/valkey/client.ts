import { env } from "$env/dynamic/private";
import { GlideClient, GlideClientConfiguration } from "@valkey/valkey-glide";

const config: GlideClientConfiguration = {
  addresses: [
    {
      host: env.VALKEY_HOST || "localhost",
      port: 6379,
    }
  ],
  databaseId: 1,
};

/**
 * Authenticated Valkey client
 */
export const valkey = await GlideClient.createClient(config);

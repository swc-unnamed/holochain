import { env } from '$env/dynamic/private';
import { functions, inngest } from '$lib/inngest';
import { serve } from 'inngest/sveltekit';

const inngestServe = serve({
  client: inngest,
  functions: functions,
  baseUrl: env.INNGEST_BASE_URL || 'http://localhost:8288',
  signingKey: env.INNGEST_SIGNING_KEY,
  streaming: "allow",
});
export const GET = inngestServe.GET;
export const POST = inngestServe.POST;
export const PUT = inngestServe.PUT;
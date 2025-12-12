import { functions, inngest } from '$lib/inngest';
import { serve } from 'inngest/sveltekit';

const inngestServe = serve({ client: inngest, functions, streaming: "allow" });
export const GET = inngestServe.GET;
export const POST = inngestServe.POST;
export const PUT = inngestServe.PUT;
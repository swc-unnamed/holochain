import { Inngest } from 'inngest';
import { schemas } from './types';
import { env } from '$env/dynamic/private';


export const inngest = new Inngest({
  id: `holochain-${env.INNGEST_INSTANCE_ENV}`,
  schemas: schemas,
  isDev: env.NODE_ENV === 'development',
  baseUrl: env.INNGEST_BASE_URL || 'http://localhost:8288',
  eventKey: env.INNGEST_EVENT_KEY
});
import { env } from '$env/dynamic/private';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error', 'log'] })
  ],

  ignoreTransactions: [
    "/api/inngest",
    "/api/health",
    "/api/metrics"
  ],

  enableMetrics: true,

  tracesSampleRate: env.SENTRY_ENV === 'prod' ? 0.2 : 1.0,
  sampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  sendDefaultPii: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,

  environment: env.SENTRY_ENV,
});
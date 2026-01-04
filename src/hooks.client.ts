import { env } from "$env/dynamic/public";
import * as Sentry from '@sentry/sveltekit';
import type { HandleClientError } from "@sveltejs/kit";

Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,
  tunnel: '/api/metrics',
  tracesSampleRate: env.PUBLIC_SENTRY_ENV === 'prod' ? 0.2 : 1.0,
  sampleRate: 1.0,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],

  ignoreTransactions: [
    "/api/inngest",
    "/api/health",
    "/api/metrics"
  ],
  enableLogs: true,
  environment: env.PUBLIC_SENTRY_ENV,
  sendDefaultPii: false
});


export const handleError: HandleClientError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();

  // example integration with https://sentry.io/
  Sentry.captureException(error, {
    extra: { event, errorId, status, message }
  });

  return {
    message: 'Whoops!',
    errorId
  };
};

/**
 * This is a server-side only route for handling tunneling for Sentry.
 */

import { json } from '@sveltejs/kit';

const SENTRY_INGEST_URL =
  'https://norvik.sentry.io/api/4510650538196992/envelope/';

export const POST = async ({ request }) => {
  try {
    const body = await request.arrayBuffer();

    await fetch(SENTRY_INGEST_URL, {
      method: 'POST',
      headers: {
        // Forward the original content type
        'Content-Type': request.headers.get('content-type') ?? 'application/octet-stream'
      },
      body
    });

  } catch (err) {
    console.error('Sentry tunnel error:', err);
  }

  // Always return 200 to the client to avoid interfering with app functionality
  return json({ status: 200 });
};
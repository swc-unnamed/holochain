import { PostHog } from 'posthog-node';
import { env } from '$env/dynamic/public';

let _client: PostHog | null = null;

export function getPostHogClient() {
  if (!_client) {
    _client = new PostHog(env.PUBLIC_POSTHOG_KEY, {
      host: env.PUBLIC_POSTHOG_HOST,
      disableGeoip: true,
    });
  }
  return _client;
}

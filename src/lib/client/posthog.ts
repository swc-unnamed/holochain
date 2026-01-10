import posthog from "posthog-js";
import { browser } from '$app/environment'
import { env } from "$env/dynamic/public";

export function initPostHog() {
  if (!browser) return
  posthog.init(env.PUBLIC_POSTHOG_KEY, {
    api_host: '/api/ph',
    ui_host: 'https://us.posthog.com',
    persistence: 'localStorage',
    capture_performance: true,
    capture_pageview: true,
    capture_heatmaps: true,
    capture_exceptions: true,
    capture_pageleave: true,
  })
}
<script lang="ts">
	import '../app.css';
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { Toaster } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { navigating } from '$app/state';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import posthog from 'posthog-js';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	NProgress.configure({
		minimum: 0.16,
		easing: 'ease',
		showSpinner: false,
		template: `<div class="bar" style="background: #246eb;" role="bar"><div class="peg"></div></div>`
	});

	// PostHog pageview & pageleave tracking
	if (browser) {
		beforeNavigate(() => posthog.capture('$pageleave'));
		afterNavigate(() => posthog.capture('$pageview'));
	}

	$effect(() => {
		if (browser) {
			if (navigating.to) {
				NProgress.start();
			}

			if (!navigating.to) {
				NProgress.done();
			}
		}
	});
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<meta property="og:title" content="Unnamed Market" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={data.origin} />
	<meta property="og:image" content={`${data.origin}/images/uim-17.png`} />
	<meta property="og:description" content="Unnamed Market - Your gateway to the holochain." />
	<meta name="theme-color" content="#0a0a0a" />

	<!-- Include this to make the og:image larger -->
	<meta name="twitter:card" content={`${data.origin}/images/uim-17.png`} />
</svelte:head>

<Toaster position="top-right" richColors />
{@render children()}

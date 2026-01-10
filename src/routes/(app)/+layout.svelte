<script lang="ts">
	import { initPostHog } from '$lib/client/posthog';
	import AppSidebar from '$lib/components/layout/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { onMount } from 'svelte';
	let { children } = $props();

	onMount(() => {
		initPostHog();
	});
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar class="rounded-lg" variant="inset" />
	{@render children()}
</Sidebar.Provider>

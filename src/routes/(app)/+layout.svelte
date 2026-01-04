<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import * as Sentry from '@sentry/sveltekit';
	import AppSidebar from '$lib/components/layout/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	let { children } = $props();

	afterNavigate(() => {
		const user = page.data?.user;
		if (user) {
			Sentry.setUser({
				id: user.id,
				username: user.name,
				ip_address: null,
				geo: {}
			});
		} else {
			Sentry.setUser(null);
		}
	});
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar class="rounded-lg" variant="inset" />
	{@render children()}
</Sidebar.Provider>

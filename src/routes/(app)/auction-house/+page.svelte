<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { able } from '$lib/utils/auth/able.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	const auctions = $derived(data.auctions);
</script>

<PageWrapper title="Auction House">
	<WipBanner />

	{#if auctions.length < 1}
		<Empty
			title="No Auctions Available"
			description="There are currently no auctions available for you."
		/>
	{/if}
</PageWrapper>

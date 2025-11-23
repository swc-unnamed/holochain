<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import { able } from '$lib/utils/auth/able.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';

	let { data } = $props();
	const auctions = $derived(data.auctions);
</script>

<PageWrapper title="Auction House">
	<WipBanner />
	<Item
		title="I get it - it's ugly right now"
		description="But I'm working on it! In the meantime, browse available auctions below."
		variant="outline"
	/>

	{#if auctions.length < 1}
		<Empty
			title="No Auctions Available"
			description="There are currently no auctions available for you."
		/>
	{/if}

	{#if auctions.length > 0}
		{#each auctions as auction}
			<Item
				title={auction.title}
				description={auction.description || 'No description provided.'}
				variant="outline"
				action={{
					text: 'View',
					onClick: async () => await goto(`/auction-house/auctions/${auction.id}`)
				}}
			>
				{#snippet footer()}
					<div class="flex flex-wrap items-center gap-2">
						<span class="font-medium">Lots: {auction._count.lots}</span>
						{#if auction.start}
							<span class="">Start {standardDateFormat(auction.start)}</span>
						{/if}
						{#if auction.end}
							<span class="">End {standardDateFormat(auction.end)}</span>
						{/if}
					</div>
				{/snippet}
			</Item>
		{/each}
	{/if}
</PageWrapper>

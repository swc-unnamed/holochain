<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';

	const { data } = $props();
	let auction = $derived(data.auction);
</script>

<PageWrapper title="{auction.title} Results">
	<CardWrapper title="{auction.title} Results">
		<p>
			This is the Post Auction page. Which will be used to give admins the view to finish up various
			tasks.
		</p>

		<div class="grid gap-3">
			{#each auction.lots as lot}
				<div class="rounded border p-4">
					<h3 class="mb-2 text-lg font-medium">{lot.title} Results</h3>
					{#if lot.purchasePrice}
						<p>Winning Bid: {lot.purchasePrice} credits by {lot.purchasedBy?.displayName}</p>
					{:else}
						<p>No bids were placed on this lot.</p>
					{/if}
				</div>
			{/each}
		</div>
	</CardWrapper>
</PageWrapper>

<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { getLot } from '$lib/remote/auction-house/auctions/manage/get-lot.remote';

	let { data } = $props();
	let lot = $derived(await getLot({ id: data.lotId }));
</script>

<PageWrapper
	title="Manage Lot Item"
	crumbOverrides={[
		[lot.auctionId!, lot.auction!.title.toUpperCase()],
		[lot.id, lot.title]
	]}
>
	<CardWrapper>
		<p></p>
	</CardWrapper>
</PageWrapper>

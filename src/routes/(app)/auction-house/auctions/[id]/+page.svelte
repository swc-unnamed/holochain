<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import LotItemAction from '$lib/components/custom/modules/auction-house/lot-item-action.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import HyperlinkCell from '$lib/components/custom/data-table/hyperlink-cell.svelte';

	let { data } = $props();
	let auction = $derived(data.auction);
	const mobile = new IsMobile();
</script>

<PageWrapper title="Auction Details">
	<CardWrapper title={auction.title} titleContainerClass="items-start">
		{#snippet header()}
			<div class="flex flex-col justify-start">
				<span class="mr-4 text-sm">Status: {auction.status}</span>
				{#if auction.start && auction.end}
					<span class="text-sm">Starts: {standardDateFormat(auction.start)}</span>
					<span class="text-sm">End: {standardDateFormat(auction.end)}</span>
				{/if}
			</div>
		{/snippet}
		<p class="whitespace-pre-wrap">{auction.description}</p>
	</CardWrapper>

	{#each auction.lots as lot}
		<CardWrapper title={`${lot.lotNumber} - ${lot.title}`}>
			{#snippet header()}
				<div class="flex flex-col justify-start">
					<span class="mr-4 text-sm">Lot Number: {lot.lotNumber}</span>
					<span class="text-sm">
						Minimum Bid: {lot.startPrice}
					</span>
				</div>
			{/snippet}
			{#if !mobile.current}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Lot</Table.Head>
							<Table.Head>Entity</Table.Head>
							<Table.Head>Quantity</Table.Head>
							<Table.Head>UUU</Table.Head>
							<Table.Head>Batch</Table.Head>
							<Table.Head>Custom</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each lot.items as item}
							<Table.Row>
								<Table.Cell>
									<HyperlinkCell
										text={item.entity.name}
										href={`/holochain/database/${item.entityId}`}
									/>
								</Table.Cell>
								<Table.Cell>{item.entity.name}</Table.Cell>
								<Table.Cell>{item.quantity}</Table.Cell>
								<Table.Cell>{item.uuu}</Table.Cell>
								<Table.Cell>{item.batch}</Table.Cell>
								<Table.Cell>{item.custom}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}

			{#if mobile.current}
				{#each lot.items as item}
					<LotItemAction {item} entities={[item.entity]} hideActions />
				{/each}
			{/if}
		</CardWrapper>
	{/each}
</PageWrapper>

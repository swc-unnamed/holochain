<script lang="ts">
	import { goto, preloadData } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import * as Table from '$lib/components/ui/table';
	import { parseCurrency, toLocalCurrency } from '$lib/utils/helpers/shared/currency.js';
	const { data } = $props();
	let auction = $derived(data.auction);
</script>

<PageWrapper title="{auction.title} Results">
	<CardWrapper title="{auction.title} Results">
		<div class="grid gap-3">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Lot Number</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Purchased By</Table.Head>
						<Table.Head>Created By</Table.Head>
						<Table.Head>Purchase Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each auction.lots as lot}
						<Table.Row
							class="hover:cursor-pointer"
							onclick={async () => {
								await goto(`/auction-house/lots/${lot.id}/manage`);
							}}
							onmouseenter={async () => {
								await preloadData(`/auction-house/lots/${lot.id}/manage`);
							}}
						>
							<Table.Cell>{lot.lotNumber}</Table.Cell>
							<Table.Cell>{lot.status}</Table.Cell>
							<Table.Cell>{lot.purchasedBy?.displayName}</Table.Cell>
							<Table.Cell>{lot.createdBy?.displayName}</Table.Cell>
							<Table.Cell>{toLocalCurrency(lot.purchasePrice || '0')} cr</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</CardWrapper>
</PageWrapper>

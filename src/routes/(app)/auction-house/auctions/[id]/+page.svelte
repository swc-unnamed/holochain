<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import LotItemAction from '$lib/components/custom/modules/auction-house/lot-item-action.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import HyperlinkCell from '$lib/components/custom/data-table/hyperlink-cell.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Edit, Edit2, Pencil } from '@lucide/svelte';
	import { toAbbrCurrency, toLocalCurrency } from '$lib/utils/helpers/shared/currency.js';

	let { data } = $props();
	let auction = $derived(data.auction);
	const mobile = new IsMobile();
</script>

<PageWrapper title="Auction Details" crumbOverrides={[[auction.id, auction.title]]}>
	<CardWrapper title={auction.title} description={auction.description ?? ''}>
		{#snippet header()}
			<div class="flex items-center gap-1">
				<span
					class="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium tracking-wide text-primary uppercase"
				>
					{auction.status}
				</span>
				<Button size="sm" variant="outline" href={`/auction-house/auctions/${auction.id}/manage`}>
					<Pencil />
					<span>Manage</span>
				</Button>
			</div>
		{/snippet}
		<div class="space-y-6">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="rounded-xl border border-border/80 bg-muted/40 p-4">
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Starts</p>
					<p class="text-lg font-semibold text-foreground">
						{auction.start ? standardDateFormat(auction.start) : 'Not scheduled'}
					</p>
				</div>
				<div class="rounded-xl border border-border/80 bg-muted/40 p-4">
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Ends</p>
					<p class="text-lg font-semibold text-foreground">
						{auction.end ? standardDateFormat(auction.end) : 'Not scheduled'}
					</p>
				</div>
				<div class="rounded-xl border border-border/80 bg-muted/40 p-4">
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Lots Assigned</p>
					<p class="text-lg font-semibold text-foreground">
						{auction.lots?.length ?? 0}
					</p>
				</div>
			</div>
		</div>
	</CardWrapper>

	{#each auction.lots as lot}
		<CardWrapper title={lot.title}>
			{#snippet header()}
				<div class="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
					<div class="grid gap-1 text-sm text-muted-foreground">
						<span class="font-semibold text-foreground">Lot #{lot.lotNumber}</span>
						<span>Minimum Bid · {toAbbrCurrency(lot.startPrice)}</span>
						<span>
							Items · {lot.items?.length ?? 0}
						</span>
					</div>
				</div>
			{/snippet}
			<div class="space-y-4">
				<div
					class="grid grid-cols-1 gap-4 rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 sm:grid-cols-3"
				>
					<div>
						<p class="text-xs tracking-wide text-muted-foreground uppercase">Lot Number</p>
						<p class="text-base font-medium text-foreground">{lot.lotNumber}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-muted-foreground uppercase">Minimum Bid</p>
						<p class="text-base font-medium text-foreground">{toLocalCurrency(lot.startPrice)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-muted-foreground uppercase">Item Count</p>
						<p class="text-base font-medium text-foreground">{lot.items?.length ?? 0}</p>
					</div>
				</div>
				{#if !mobile.current}
					<Table.Root>
						<Table.Header>
							<Table.Row>
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
			</div>
		</CardWrapper>
	{/each}
</PageWrapper>

<script lang="ts">
	import { goto, preloadData } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import type { Lot } from '$lib/generated/prisma/client.js';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte.js';
	import { toast } from 'svelte-sonner';
	import { toAbbrCurrency, toLocalCurrency } from '$lib/utils/helpers/shared/currency';
	import * as UnderLineTabs from '$lib/components/custom/underline-tabs';
	import HyperlinkCell from '$lib/components/custom/data-table/hyperlink-cell.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { lotStatusSelect } from '$lib/types/auction-house/lot-status';
	import { getCurrentUserLots } from '$lib/remote/auction-house/lot/get-current-user-lots.remote';
	import Pagination from '$lib/components/custom/pagination/pagination.svelte';
	import { getCurrentUserLotStats } from '$lib/remote/auction-house/lot/get-current-user-lot-stats.remote';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';

	const query = new QueryState<Lot>({
		order: [{ field: 'lotNumber', direction: 'desc' }],
		pagination: {
			take: 50,
			mode: 'offset'
		}
	});

	// Search query
	let searchQuery = $state('');
	let { lots, totalCount } = $derived(await getCurrentUserLots(query.current));

	let { lotsByStatus, purchasedTotal, soldTotal } = $derived(await getCurrentUserLotStats());

	$effect(() => {
		if (totalCount) {
			query.setCount(totalCount);
		}
	});
</script>

<PageWrapper title="Lot Profile">
	{#snippet header()}
		<Button href="/auction-house/lots/create" size="sm">
			<Icon icon="mdi:plus" />
			<span>Create Lot</span>
		</Button>
	{/snippet}

	<div class="md:grid-col-2 grid grid-cols-1 gap-3 lg:grid-cols-4">
		<CardWrapper title="Submitted" description="Awaiting to be added to an Auction">
			<div class="text-2xl text-primary">
				{#if lotsByStatus.find((x) => x.status === 'SUBMITTED')?._count.id === undefined}
					<p>-</p>
				{:else}
					<p>{lotsByStatus.find((x) => x.status === 'SUBMITTED')?._count.id}</p>
				{/if}
			</div>
		</CardWrapper>

		<CardWrapper title="Scheduled" description="Lots assigned to an upcoming Auction">
			<div class="text-2xl text-primary">
				{#if lotsByStatus.find((x) => x.status === 'SCHEDULED')?._count.id === undefined}
					<p>-</p>
				{:else}
					<p>{lotsByStatus.find((x) => x.status === 'SCHEDULED')?._count.id}</p>
				{/if}
			</div>
		</CardWrapper>

		<CardWrapper title="Sold" description="Awaiting makeover">
			<div class="text-2xl text-primary">
				{#if lotsByStatus.find((x) => x.status === 'SOLD')?._count.id === undefined}
					<p>-</p>
				{:else}
					<p>{lotsByStatus.find((x) => x.status === 'SOLD')?._count.id}</p>
				{/if}
			</div>
		</CardWrapper>

		<CardWrapper title="Completed" description="All actions completed">
			<div class="text-2xl text-primary">
				{#if lotsByStatus.find((x) => x.status === 'COMPLETED')?._count.id === undefined}
					<p>-</p>
				{:else}
					<p>{lotsByStatus.find((x) => x.status === 'COMPLETED')?._count.id}</p>
				{/if}
			</div>
		</CardWrapper>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		<CardWrapper title="Total Purchased Amount">
			{#if purchasedTotal === 0}
				<div class="text-primary">
					<p class="text-center text-3xl">-</p>
					<p class="text-md text-center text-muted-foreground">-</p>
				</div>
			{:else}
				<div class="text-primary">
					<p class="text-center text-3xl">{toAbbrCurrency(purchasedTotal)}</p>
					<p class="text-md text-center text-muted-foreground">{toLocalCurrency(purchasedTotal)}</p>
				</div>
			{/if}
		</CardWrapper>

		<CardWrapper title="Total Sold Amount">
			{#if soldTotal === 0}
				<div class="text-primary">
					<p class="text-center text-3xl">-</p>
					<p class="text-md text-center text-muted-foreground">-</p>
				</div>
			{:else}
				<div class="text-primary">
					<p class="text-center text-3xl">{toAbbrCurrency(soldTotal)}</p>
					<p class="text-md text-center text-muted-foreground">{toLocalCurrency(soldTotal)}</p>
				</div>
			{/if}
		</CardWrapper>

		<div class="md:col-span-2">
			<CardWrapper title="Auction Delta">
				{#if soldTotal - purchasedTotal === 0}
					<div class="text-primary">
						<p class="text-center text-3xl">-</p>
						<p class="text-md text-center text-muted-foreground">-</p>
					</div>
				{:else}
					<div class="text-primary">
						<p
							class={cn(
								'text-center text-3xl',
								soldTotal - purchasedTotal < 0 ? 'text-destructive' : ''
							)}
						>
							{toAbbrCurrency(soldTotal - purchasedTotal)}
						</p>
						<p
							class={cn(
								'text-md text-center',
								soldTotal - purchasedTotal < 0 ? 'text-destructive' : 'text-muted-foreground'
							)}
						>
							{toLocalCurrency(soldTotal - purchasedTotal)}
						</p>
					</div>
				{/if}
			</CardWrapper>
		</div>
	</div>
	<CardWrapper title="Lot Data">
		{#snippet header()}
			<div class="">
				<SelectInput
					type="single"
					label="Status"
					records={lotStatusSelect}
					allowDeselect
					labelKey="label"
					valueKey="value"
					onValueChange={(value) => {
						query.where.remove('status');
						if (value) {
							query.where.add('status', value);
						} else {
							query.where.add('status', 'DRAFT');
						}
					}}
				/>
			</div>
		{/snippet}
		<Table.Root>
			<Table.Caption>
				<Pagination {query} perPage={50} />
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Lot Number</Table.Head>
					<Table.Head>Title</Table.Head>
					<Table.Head>Starting Bid</Table.Head>
					<Table.Head>Purchased Bid</Table.Head>
					<Table.Head>Assigned Auction</Table.Head>
					<Table.Head>Status</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each lots as lot}
					<Table.Row>
						<Table.Cell>
							<HyperlinkCell
								href={`/auction-house/lots/${lot.id}`}
								text={lot.lotNumber.toString()}
							/>
						</Table.Cell>
						<Table.Cell>{lot.title}</Table.Cell>
						<Table.Cell>{toAbbrCurrency(lot.startPrice)}</Table.Cell>
						<Table.Cell>{lot.purchasePrice ? toAbbrCurrency(lot.purchasePrice) : '-'}</Table.Cell>
						<Table.Cell>
							{#if lot.auction}
								<HyperlinkCell
									href={`/auction-house/auctions/${lot.auction.id}`}
									text={lot.auction.title}
								/>
							{:else}
								-
							{/if}
						</Table.Cell>
						<Table.Cell>
							<Badge variant="outline">{lot.status}</Badge>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</CardWrapper>
</PageWrapper>

<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import type { Lot } from '$lib/generated/prisma/client.js';
	import { createDraftLot } from '$lib/remote/auction-house/lot/create-draft-lot.remote.js';
	import { getMeLots } from '$lib/remote/auction-house/lot/me/get-me-lots.remote.js';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte.js';
	import { toast } from 'svelte-sonner';
	import { toLocalCurrency } from '$lib/utils/helpers/shared/currency';

	// Icons
	import { Search, Package, TrendingUp, FileText, Eye, Plus, Loader2 } from '@lucide/svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';

	const query = new QueryState<Lot>({
		order: [{ field: 'lotNumber', direction: 'desc' }]
	});

	// Search query
	let searchQuery = $state('');

	// Load lots with query state
	let lotsData = $derived.by(async () => {
		const result = await getMeLots(query.current);
		query.setCount(result.totalCount);
		return result;
	});

	// Filter lots by search query on client side (after fetch)
	const filteredLots = $derived.by(() => {
		return lotsData.then((result) => {
			if (!searchQuery.trim()) return result.lots;

			const q = searchQuery.toLowerCase();
			return result.lots.filter((lot) => {
				const lotNumber = `#${lot.lotNumber}`.toLowerCase();
				const title = lot.title.toLowerCase();
				const details = lot.details?.toLowerCase() || '';
				return lotNumber.includes(q) || title.includes(q) || details.includes(q);
			});
		});
	});

	// Group lots by status
	const groupedLots = $derived.by(() => {
		return filteredLots.then((lots) => {
			const groups: Record<string, typeof lots> = {};
			for (const lot of lots) {
				const status = lot.status;
				if (!groups[status]) groups[status] = [];
				groups[status].push(lot);
			}
			return groups;
		});
	});

	// Summary stats
	const stats = $derived.by(() => {
		return filteredLots.then((lots) => {
			const totalLots = lots.length;
			const totalItems = lots.reduce((sum, lot) => sum + lot.items.length, 0);
			const totalValue = lots.reduce((sum, lot) => {
				const price = lot.purchasePrice || lot.startPrice;
				return sum + Number(price);
			}, 0);

			const byStatus = lots.reduce(
				(acc, lot) => {
					acc[lot.status] = (acc[lot.status] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>
			);

			return { totalLots, totalItems, totalValue, byStatus };
		});
	});

	async function generateDraft() {
		const res = await createDraftLot();
		if (res.success) {
			toast.success(res.message);
			await goto(`/auction-house/lots/${res.id}/edit`);
		} else {
			toast.error(res.message);
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'DRAFT':
				return 'secondary';
			case 'LISTED':
				return 'default';
			case 'SOLD':
				return 'default';
			case 'WITHDRAWN':
				return 'outline';
			case 'COMPLETED':
				return 'default';
			default:
				return 'secondary';
		}
	}

	function getStatusLabel(status: string) {
		return status.charAt(0) + status.slice(1).toLowerCase();
	}
</script>

<PageWrapper title="My Lots">
	<WipBanner />
	{#await stats}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="size-8 animate-spin text-muted-foreground" />
		</div>
	{:then statsData}
		<!-- Summary Stats -->
		<div class="mb-6 grid gap-4 md:grid-cols-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">Total Lots</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-2">
						<Package class="size-4 text-muted-foreground" />
						<span class="text-2xl font-bold">{statsData.totalLots}</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">Total Items</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-2">
						<FileText class="size-4 text-muted-foreground" />
						<span class="text-2xl font-bold">{statsData.totalItems}</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">Total Value</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-2">
						<TrendingUp class="size-4 text-muted-foreground" />
						<span class="text-2xl font-bold">{toLocalCurrency(statsData.totalValue)}</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">By Status</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						{#each Object.entries(statsData.byStatus) as [status, count]}
							<Badge variant={getStatusColor(status)}>
								{getStatusLabel(status)}: {count}
							</Badge>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<CardWrapper title="My Lots">
			{#snippet header()}
				<Button onclick={generateDraft} class="gap-2">
					<Plus class="size-4" />
					Create Lot
				</Button>
			{/snippet}

			<!-- Search Bar -->
			<div class="mb-6">
				<div class="relative">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by lot number, title, or description..."
						bind:value={searchQuery}
						class="pl-10"
					/>
				</div>
			</div>

			{#await groupedLots}
				<div class="flex items-center justify-center py-12">
					<Loader2 class="size-8 animate-spin text-muted-foreground" />
				</div>
			{:then groups}
				{#if Object.keys(groups).length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12"
					>
						<Package class="mb-4 size-12 text-muted-foreground" />
						<h3 class="mb-2 text-lg font-semibold">No lots found</h3>
						<p class="mb-4 text-sm text-muted-foreground">
							{searchQuery ? 'Try adjusting your search' : 'Create your first lot to get started'}
						</p>
						{#if !searchQuery}
							<Button onclick={generateDraft} class="gap-2">
								<Plus class="size-4" />
								Create Lot
							</Button>
						{/if}
					</div>
				{:else}
					{#each Object.entries(groups) as [status, lots]}
						<div class="mb-8">
							<div class="mb-4 flex items-center gap-3">
								<h2 class="text-xl font-semibold">{getStatusLabel(status)}</h2>
								<Badge variant={getStatusColor(status)}>{lots.length}</Badge>
							</div>

							<Separator class="mb-4" />

							<!-- Mobile: Card View -->
							<div class="grid gap-4 md:hidden">
								{#each lots as lot (lot.id)}
									{@const itemCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)}
									<Card.Root class="overflow-hidden">
										<Card.Header class="pb-3">
											<div class="flex items-start justify-between gap-2">
												<div class="flex-1">
													<Card.Title class="text-base">
														<Badge variant="outline" class="mb-2">#{lot.lotNumber}</Badge>
														{lot.title}
													</Card.Title>
													<Card.Description class="mt-1 text-xs whitespace-pre-wrap">
														{lot.details}
													</Card.Description>
												</div>
											</div>
										</Card.Header>
										<Card.Content class="space-y-3 pb-3">
											<div class="grid grid-cols-2 gap-2 text-sm">
												<div>
													<p class="text-xs text-muted-foreground">Start Price</p>
													<p class="font-medium">{toLocalCurrency(lot.startPrice)} cr</p>
												</div>
												{#if lot.purchasePrice}
													<div>
														<p class="text-xs text-muted-foreground">Purchase Price</p>
														<p class="font-medium">{toLocalCurrency(lot.purchasePrice)} cr</p>
													</div>
												{/if}
											</div>

											<div>
												<p class="mb-2 text-xs font-medium text-muted-foreground">
													Items ({itemCount} total)
												</p>
												<ul class="ml-4 list-disc space-y-1 text-xs">
													{#each lot.items as item (item.id)}
														<li>
															{#if item.batch}
																{item.quantity}
																{item.quantity === 1 ? 'batch' : 'batches'} of {item.name}
															{:else}
																{item.quantity} × {item.name}
															{/if}
														</li>
													{/each}
												</ul>
											</div>

											{#if lot.auction}
												<div>
													<p class="text-xs text-muted-foreground">Auction</p>
													<p class="text-sm font-medium">{lot.auction.title}</p>
												</div>
											{/if}
										</Card.Content>
										<Card.Footer class="pt-3">
											<Button
												variant="outline"
												size="sm"
												onclick={() => goto(`/auction-house/lots/${lot.id}`)}
												class="w-full gap-2"
											>
												<Eye class="size-4" />
												View Details
											</Button>
										</Card.Footer>
									</Card.Root>
								{/each}
							</div>

							<!-- Desktop: Table View -->
							<div class="hidden md:block">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head class="w-[100px]">Lot #</Table.Head>
											<Table.Head>Title</Table.Head>
											<Table.Head>Items</Table.Head>
											<Table.Head class="text-right">Start Price</Table.Head>
											{#if lots.some((l) => l.purchasePrice)}
												<Table.Head class="text-right">Purchase Price</Table.Head>
											{/if}
											{#if lots.some((l) => l.auction)}
												<Table.Head>Auction</Table.Head>
											{/if}
											<Table.Head class="text-right">Actions</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each lots as lot (lot.id)}
											{@const itemCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)}
											<Table.Row>
												<Table.Cell class="font-medium">
													<Badge variant="outline">#{lot.lotNumber}</Badge>
												</Table.Cell>
												<Table.Cell>
													<div>
														<p class="font-medium">{lot.title}</p>
														<p class="text-xs whitespace-pre-wrap text-muted-foreground">
															{lot.details}
														</p>
													</div>
												</Table.Cell>
												<Table.Cell>
													<div class="max-w-xs">
														<p class="mb-1 text-xs font-medium text-muted-foreground">
															{itemCount} total
														</p>
														<ul class="ml-4 list-disc space-y-0.5 text-xs">
															{#each lot.items as item (item.id)}
																<li>
																	{#if item.batch}
																		{item.quantity}
																		{item.quantity === 1 ? 'batch' : 'batches'} of {item.name}
																	{:else}
																		{item.quantity} × {item.name}
																	{/if}
																</li>
															{/each}
														</ul>
													</div>
												</Table.Cell>
												<Table.Cell class="text-right">
													{toLocalCurrency(lot.startPrice)} cr
												</Table.Cell>
												{#if lots.some((l) => l.purchasePrice)}
													<Table.Cell class="text-right">
														{lot.purchasePrice ? `${toLocalCurrency(lot.purchasePrice)} cr` : '-'}
													</Table.Cell>
												{/if}
												{#if lots.some((l) => l.auction)}
													<Table.Cell>
														{#if lot.auction}
															<div>
																<p class="text-sm font-medium">{lot.auction.title}</p>
																<Badge variant="outline" class="mt-1">
																	{getStatusLabel(lot.auction.status)}
																</Badge>
															</div>
														{:else}
															-
														{/if}
													</Table.Cell>
												{/if}
												<Table.Cell class="text-right">
													<Button
														variant="ghost"
														size="sm"
														onclick={() => goto(`/auction-house/lots/${lot.id}`)}
														class="gap-2"
													>
														<Eye class="size-4" />
														View
													</Button>
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						</div>
					{/each}
				{/if}
			{/await}
		</CardWrapper>
	{/await}
</PageWrapper>

<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Pencil,
		CircleDot,
		Gavel,
		Hash,
		Layers,
		Package,
		ChevronLeft,
		ChevronRight,
		Coins,
		MapPin,
		Calendar,
		User,
		UserX
	} from '@lucide/svelte';
	import { toAbbrCurrency } from '$lib/utils/helpers/shared/currency.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let auction = $derived(data.auction);

	// Lot navigation state
	let currentLotIndex = $state(0);
	let currentLot = $derived(auction.lots[currentLotIndex]);
	let hasPrev = $derived(currentLotIndex > 0);
	let hasNext = $derived(currentLotIndex < auction.lots.length - 1);

	function prevLot() {
		if (hasPrev) currentLotIndex--;
	}

	function nextLot() {
		if (hasNext) currentLotIndex++;
	}

	function selectLot(index: number) {
		currentLotIndex = index;
	}
</script>

<PageWrapper title="Auction Details" crumbOverrides={[[auction.id, auction.title]]}>
	<!-- Auction Header Card -->
	<div class="rounded-xl border border-border/60 bg-card p-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="space-y-2">
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-bold">{auction.title}</h1>
					<Badge
						variant={auction.status === 'ACTIVE' ? 'default' : 'secondary'}
						class="px-3 py-1 text-sm"
					>
						<CircleDot class="mr-1 size-3" />
						{auction.status}
					</Badge>
				</div>
				{#if auction.description}
					<p class="max-w-2xl text-muted-foreground">{auction.description}</p>
				{/if}
			</div>
			<Button size="sm" variant="outline" href={`/auction-house/auctions/${auction.id}/manage`}>
				<Pencil class="size-4" />
				<span>Manage</span>
			</Button>
		</div>

		<!-- Auction Stats -->
		<div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
			<div class="rounded-lg border border-border/60 bg-muted/20 p-4">
				<p class="flex items-center gap-1 text-xs text-muted-foreground uppercase">
					<Calendar class="size-3" />
					Starts
				</p>
				<p class="mt-1 text-lg font-semibold">
					{auction.start ? standardDateFormat(auction.start) : 'Not scheduled'}
				</p>
			</div>
			<div class="rounded-lg border border-border/60 bg-muted/20 p-4">
				<p class="flex items-center gap-1 text-xs text-muted-foreground uppercase">
					<Gavel class="size-3" />
					Total Lots
				</p>
				<p class="mt-1 text-lg font-semibold">{auction.lots.length}</p>
			</div>
			<div class="rounded-lg border border-border/60 bg-muted/20 p-4">
				<p class="flex items-center gap-1 text-xs text-muted-foreground uppercase">
					<Package class="size-3" />
					Total Items
				</p>
				<p class="mt-1 text-lg font-semibold">
					{auction.lots.reduce((sum, lot) => sum + (lot.items?.length ?? 0), 0)}
				</p>
			</div>
		</div>
	</div>

	{#if auction.lots.length === 0}
		<Empty description="No lots assigned to this auction yet." />
	{:else}
		<!-- Lots Browser -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
			<!-- Current Lot Spotlight (3 cols) -->
			<div class="space-y-4 lg:col-span-3">
				<!-- Lot Navigation -->
				<div class="flex items-center justify-between">
					<Button variant="outline" size="sm" onclick={prevLot} disabled={!hasPrev}>
						<Icon icon="mdi:chevron-left" class="size-4" />
						<span>Previous</span>
					</Button>
					<div class="text-center">
						<p class="flex items-center justify-center gap-1 text-2xl font-bold">
							Lot {currentLot.lotNumber}
						</p>
						<p class="text-sm text-muted-foreground">{currentLot.title}</p>
					</div>
					<Button variant="outline" size="sm" onclick={nextLot} disabled={!hasNext}>
						<span>Next</span>
						<Icon icon="mdi:chevron-right" class="size-4" />
					</Button>
				</div>

				<!-- Current Lot Details Card -->
				<div class="rounded-xl border-2 border-primary/50 bg-card p-6">
					<!-- Lot Header -->
					<div class="mb-4 flex items-center justify-between border-b border-border/60 pb-4">
						<div class=" flex flex-wrap items-center gap-2">
							<Badge variant="outline" class="text-sm">{currentLot.status}</Badge>
							{#if currentLot.anonLot}
								<Badge variant="secondary" class="text-sm">
									<Icon icon="mdi:user-card-details-outline" class="size-4" />
									Anonymous
								</Badge>
							{/if}
							<!-- Seller Info -->
							{#if currentLot.createdBy}
								<Badge variant="outline" class="text-sm">
									{#if currentLot.anonLot}
										<Icon icon="mdi:user-card-details-outline" class="size-4" />
										{currentLot.createdBy.anonid}
									{:else}
										<Icon icon="mdi:user" class="size-4" />
										{currentLot.createdBy.displayName}
									{/if}
								</Badge>
							{/if}
						</div>

						<div class="flex items-center gap-2">
							<Button size="sm" variant="outline" href={`/auction-house/lots/${currentLot.id}`}
								>View Lot</Button
							>
						</div>
					</div>

					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<div>
							<p class="whitespace-pre-wrap">
								{currentLot.details || 'No details provided'}
							</p>
							{#if currentLot.location}
								<p class="mt-1 flex items-center gap-1 text-sm whitespace-pre-wrap">
									<span>MAP_ICON</span>
									{currentLot.location}
								</p>
							{/if}
						</div>
						<div class="text-right">
							<p
								class="flex items-center justify-end gap-1 text-xs text-muted-foreground uppercase"
							>
								<Coins class="size-3" />
								Starting Bid
							</p>
							<p class="text-3xl font-bold text-primary">
								{toAbbrCurrency(currentLot.startPrice)}
							</p>
							<p class="text-sm text-muted-foreground">credits</p>
						</div>
					</div>

					<!-- Items in Current Lot -->
					<div class="border-t border-border/60 pt-4">
						<div class="mb-3 flex items-center gap-2">
							<Layers class="size-4 text-muted-foreground" />
							<span class="text-sm font-medium">{currentLot.items.length} Items</span>
						</div>

						{#if currentLot.items.length === 0}
							<div
								class="flex items-center justify-center rounded-lg border border-dashed border-border p-8 text-muted-foreground"
							>
								<Package class="mr-2 size-5" />
								<span>No items in this lot</span>
							</div>
						{:else}
							<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
								{#each currentLot.items as item}
									<a
										href="/holochain/database/{item.entityId}"
										target="_blank"
										rel="noopener noreferrer"
										class="group overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-all hover:border-primary/40"
									>
										<div class="aspect-square overflow-hidden">
											<img
												src={item.entity.imageLarge}
												alt={item.entity.name}
												class="h-full w-full rounded-xl border bg-black object-cover p-2 transition-transform group-hover:scale-105"
											/>
										</div>
										<div class="p-3">
											<p class="font-medium">{item.entity.name}</p>
											<div class="mt-1 flex flex-wrap items-center gap-1">
												<Badge variant="secondary" class="text-xs">x{item.quantity}</Badge>
												{#if item.custom}
													<Badge variant="outline" class="text-xs">Custom</Badge>
												{/if}
												{#if item.batch}
													<Badge variant="outline" class="text-xs">Batch</Badge>
												{/if}
												{#if item.uuu}
													<Badge variant="outline" class="text-xs">UUU</Badge>
												{/if}
											</div>
										</div>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Lot Queue Sidebar (1 col) -->
			<div class="lg:col-span-1">
				<div class="sticky top-20 space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold">All Lots</h3>
						<span class="text-xs text-muted-foreground">{auction.lots.length} total</span>
					</div>

					<div class="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-1">
						{#each auction.lots as lot, index}
							<button
								onclick={() => selectLot(index)}
								class="w-full rounded-lg border p-3 text-left transition-all {index ===
								currentLotIndex
									? 'border-primary bg-primary/10'
									: 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40'}"
							>
								<div class="flex items-center gap-2">
									<div
										class="flex size-8 shrink-0 items-center justify-center rounded bg-muted font-mono text-xs font-bold {index ===
										currentLotIndex
											? 'bg-primary text-primary-foreground'
											: ''}"
									>
										<Icon icon="mdi:webpack" class="size-6" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">{lot.title}</p>
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">
												{lot.items.length} items
											</span>
											<Badge variant="outline" class="px-1 py-0 text-[10px]">{lot.status}</Badge>
										</div>
									</div>
								</div>
								<!-- Mini image preview -->
								{#if lot.items.length > 0}
									<div class="mt-2 flex -space-x-2">
										{#each lot.items.slice(0, 4) as item}
											<img
												src={item.entity.imageSmall}
												alt={item.entity.name}
												class="size-6 rounded border border-background object-cover"
											/>
										{/each}
										{#if lot.items.length > 4}
											<div
												class="flex size-6 items-center justify-center rounded border border-background bg-muted text-xs"
											>
												+{lot.items.length - 4}
											</div>
										{/if}
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</PageWrapper>

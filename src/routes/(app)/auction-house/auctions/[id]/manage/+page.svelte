<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { getAuctionManage } from '$lib/remote/auction-house/auctions/manage/get-auction-manage.remote.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { updateAuctionSchema } from '$lib/remote/auction-house/auctions/manage/update-auction.schema.js';
	import { updateAuction } from '$lib/remote/auction-house/auctions/manage/update-auction.remote.js';
	import { toast } from 'svelte-sonner';
	import { dateToDateInputValue } from '$lib/utils/helpers/shared/date-formatter.js';
	import { AuctionStatus } from '$lib/generated/prisma/enums.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Radio,
		SaveIcon,
		Eye,
		Package,
		ChevronLeft,
		ChevronRight,
		Settings,
		Layers,
		MapPin,
		CircleDot,
		EyeOff,
		Gavel,
		Hash,
		Coins,
		User,
		UserX,
		Send
	} from '@lucide/svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { toAbbrCurrency } from '$lib/utils/helpers/shared/currency.js';
	import { invalidate } from '$app/navigation';

	const { data } = $props();
	let auction = $state(await getAuctionManage({ id: data.auctionId }));
	let currentLotIndex = $state(0);
	let showSettings = $state(false);

	const currentLot = $derived(auction.lots[currentLotIndex]);
	const hasNext = $derived(currentLotIndex < auction.lots.length - 1);
	const hasPrev = $derived(currentLotIndex > 0);

	const statusRecords = Object.entries(AuctionStatus).map(([key, value]) => ({
		label: key,
		value: value
	}));

	const cmd = new CommandForm(updateAuctionSchema, {
		command: updateAuction,
		invalidate: 'auction:manage',
		initial: () => ({
			id: data.auctionId,
			title: auction.title,
			description: auction.description,
			start: auction.start ? dateToDateInputValue(auction.start) : '',
			end: auction.end ? dateToDateInputValue(auction.end) : '',
			status: auction.status
		}),
		onSuccess: async () => {
			toast.success('Auction updated successfully');
			await invalidate('auction:manage');
		},
		onError: () => {
			toast.error('Failed to update auction');
		}
	});

	function handleBroadcast() {
		toast.info('Broadcast feature coming soon!');
	}

	function handleBroadcastLot(lot: (typeof auction.lots)[0]) {
		toast.info(`Broadcasting Lot #${lot.lotNumber} - ${lot.title}`, {
			description: 'This will send the lot to Discord (coming soon!)'
		});
	}

	function nextLot() {
		if (hasNext) currentLotIndex++;
	}

	function prevLot() {
		if (hasPrev) currentLotIndex--;
	}

	function selectLot(index: number) {
		currentLotIndex = index;
	}
</script>

<PageWrapper title="Auction Control" crumbOverrides={[[auction.id, auction.title]]}>
	<!-- Control Bar - Always visible at top -->
	<div
		class="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm"
	>
		<div class="flex items-center gap-3">
			<Badge
				variant={auction.status === 'ACTIVE' ? 'default' : 'secondary'}
				class="px-3 py-1 text-sm"
			>
				<CircleDot class="mr-1 size-3" />
				{auction.status}
			</Badge>
			<span class="flex items-center gap-1 text-sm text-muted-foreground">
				<Gavel class="size-3" />
				{auction.lots.length} lots · {currentLotIndex + 1} of {auction.lots.length}
			</span>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => (showSettings = !showSettings)}>
				{#if showSettings}
					<EyeOff class="size-4" />
					<span class="hidden sm:inline">Hide Settings</span>
				{:else}
					<Settings class="size-4" />
					<span class="hidden sm:inline">Show Settings</span>
				{/if}
			</Button>
			<Button onclick={handleBroadcast} variant="default" size="sm">
				<Radio class="size-4" />
				<span>Broadcast</span>
			</Button>
		</div>
	</div>

	{#if auction.lots.length === 0}
		<Empty description="No lots assigned to this auction yet." />
	{:else}
		<!-- Main Layout: Current Lot + Queue -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
			<!-- Current Lot Spotlight (3 cols) -->
			<div class="space-y-4 lg:col-span-3">
				<!-- Lot Navigation -->
				<div class="flex items-center justify-between">
					<Button variant="outline" size="sm" onclick={prevLot} disabled={!hasPrev}>
						<ChevronLeft class="size-4" />
						<span>Previous</span>
					</Button>
					<div class="text-center">
						<p class="flex items-center justify-center gap-1 text-2xl font-bold">
							<Hash class="size-5" />
							Lot {currentLot.lotNumber}
						</p>
						<p class="text-sm text-muted-foreground">{currentLot.title}</p>
					</div>
					<Button variant="outline" size="sm" onclick={nextLot} disabled={!hasNext}>
						<span>Next</span>
						<ChevronRight class="size-4" />
					</Button>
				</div>

				<!-- Current Lot Details Card -->
				<div class="rounded-xl border-2 border-primary/50 bg-card p-6">
					<!-- Lot Header with Broadcast Button -->
					<div
						class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4"
					>
						<div class="flex flex-wrap items-center gap-2">
							<Badge variant="outline" class="text-sm">{currentLot.status}</Badge>
							{#if currentLot.anonLot}
								<Badge variant="secondary" class="text-sm">
									<UserX class="mr-1 size-3" />
									Anonymous
								</Badge>
							{/if}
							<!-- Seller Info -->
							{#if currentLot.createdBy}
								<Badge variant="outline" class="text-sm">
									{#if currentLot.anonLot}
										<UserX class="mr-1 size-3" />
										{currentLot.createdBy.anonid}
									{:else}
										<User class="mr-1 size-3" />
										{currentLot.createdBy.displayName}
									{/if}
								</Badge>
							{/if}
						</div>
						<Button onclick={() => handleBroadcastLot(currentLot)} variant="default" size="sm">
							<Send class="size-4" />
							<span>Broadcast Lot</span>
						</Button>
					</div>

					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<div>
							<p class="text-muted-foreground">
								{currentLot.details || 'No details provided'}
							</p>
							{#if currentLot.location}
								<p class="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
									<MapPin class="size-3" />
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

				<!-- Quick Actions for Current Lot -->
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" href="/auction-house/lots/{currentLot.id}/edit">
						<Eye class="size-4" />
						<span>Edit Lot</span>
					</Button>
				</div>
			</div>

			<!-- Lot Queue Sidebar (1 col) -->
			<div class="lg:col-span-1">
				<div class="sticky top-20 space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold">Lot Queue</h3>
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
										{lot.lotNumber}
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

	<!-- Settings Panel (collapsible) -->
	{#if showSettings}
		<div class="mt-6 border-t border-border/60 pt-6">
			<CardWrapper title="Auction Settings" description="Update auction details">
				{#snippet header()}
					<Button variant="outline" size="sm" onclick={cmd.submit} disabled={cmd.submitting}>
						{#if cmd.submitting}
							<Spinner />
						{:else}
							<SaveIcon class="size-4" />
						{/if}
						<span>Save</span>
					</Button>
				{/snippet}

				<div class="grid gap-4 md:grid-cols-2">
					<FieldInput
						label="Title"
						placeholder="Enter auction title"
						bind:value={cmd.form.title}
						issues={cmd.errors.title?.message}
						required
					/>

					<SelectInput
						label="Status"
						type="single"
						records={statusRecords}
						labelKey="label"
						valueKey="value"
						bind:value={cmd.form.status}
						issues={cmd.errors.status?.message}
						required
					/>

					<div class="md:col-span-2">
						<TextareaInput
							label="Description"
							placeholder="Enter auction description"
							bind:value={cmd.form.description}
							issues={cmd.errors.description?.message}
						/>
					</div>

					<FieldInput
						label="Start Date"
						type="datetime-local"
						bind:value={cmd.form.start}
						issues={cmd.errors.start?.message}
					/>

					<FieldInput
						label="End Date"
						type="datetime-local"
						bind:value={cmd.form.end}
						issues={cmd.errors.end?.message}
					/>
				</div>
			</CardWrapper>
		</div>
	{/if}
</PageWrapper>

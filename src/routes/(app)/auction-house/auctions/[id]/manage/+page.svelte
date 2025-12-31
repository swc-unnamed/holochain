<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CircleDot, Gavel, Layers, Package, Coins, Calendar } from '@lucide/svelte';
	import { toAbbrCurrency } from '$lib/utils/helpers/shared/currency.js';
	import Icon from '@iconify/svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { auctionStatusSelect } from '$lib/types/auction-house/auction-status.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { updateAuctionStatusSchema } from '$lib/remote/auction-house/auctions/manage/update-auction.schema.js';
	import { updateAuctionStatus } from '$lib/remote/auction-house/auctions/manage/update-auction.remote.js';
	import * as Alert from '$lib/components/ui/alert';
	import { toast } from 'svelte-sonner';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import CreditInput from '$lib/components/custom/fields/credit-input/credit-input.svelte';
	import { getUserList } from '$lib/remote/users/get-user-list.remote.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';
	import { recordSale } from '$lib/remote/auction-house/auctions/manage/record-sale.remote.js';
	import { recordSaleSchema } from '$lib/remote/auction-house/auctions/manage/record-sale.schema.js';
	import { cn } from '$lib/utils.js';
	import Item from '$lib/components/custom/item/item.svelte';
	import { broadcastAuction } from '$lib/remote/auction-house/auctions/manage/broadcast-auction.remote.js';
	import { broadcastLot } from '$lib/remote/auction-house/auctions/manage/broadcast-lot.remote.js';
	import type { HttpError } from '@sveltejs/kit';

	let { data } = $props();
	let auction = $derived(data.auction);

	let currentLotIndex = $state(0);
	let currentLot = $derived(auction.lots[currentLotIndex]);
	let hasPrev = $derived(currentLotIndex > 0);
	let hasNext = $derived(currentLotIndex < auction.lots.length - 1);
	let showLotSoldDialog = $state(false);
	let users = $state(await getUserList());

	function prevLot() {
		if (hasPrev) currentLotIndex--;
	}

	function nextLot() {
		if (hasNext) currentLotIndex++;
	}

	function selectLot(index: number) {
		currentLotIndex = index;
	}

	const statusUpdateCmd = new CommandForm(updateAuctionStatusSchema, {
		command: updateAuctionStatus,
		initial: () => ({
			id: auction.id,
			status: auction.status
		}),
		onSuccess: () => {
			toast.success('Status updated successfully');
		},
		onError: (err) => {
			const errMessage = (err as HttpError).body.message || 'Unknown error';

			toast.error('Failed to update status', {
				description: errMessage
			});
		},
		invalidate: 'ah:auction:manage'
	});

	const recordSaleCmd = new CommandForm(recordSaleSchema, {
		command: recordSale,
		reset: 'onSuccess',
		invalidate: 'ah:auction:manage',
		initial: () => ({
			winnerId: null,
			winnerMiddleId: null
		}),
		onSuccess: () => {
			toast.success('Sale recorded successfully');
			showLotSoldDialog = false;
		},
		onError: () => {
			toast.error('Failed to record sale');
		}
	});
</script>

<PageWrapper title="Auction Details" crumbOverrides={[[auction.id, auction.title]]}>
	{#if statusUpdateCmd.form.status === 'CANCELLED' && auction.status !== 'CANCELLED'}
		<Alert.Root>
			<Alert.Description class="text-destructive">
				Changing the Auction Status to "CANCELLED" will move all lots back to Submitted status and
				notify all participants. This action cannot be undone.
			</Alert.Description>
		</Alert.Root>
	{/if}

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
			<div class="flex items-end gap-2">
				{#if auction.status === 'ACTIVE'}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="outline">
									<Icon icon="mdi:dots-vertical" class="size-5" />
									<span>Actions</span>
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="max-w-48">
							<DropdownMenu.Group>
								<DropdownMenu.Item
									onclick={async () => {
										await broadcastAuction({ id: auction.id });
										toast.success('Auction broadcast initiated');
									}}
								>
									<Icon icon="mdi:discord" />
									<span>Broadcast to Discord</span>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onclick={async () => {
										toast.success('coming soon');
									}}
								>
									<Icon icon="mdi:plus" />
									<span>Add Lot</span>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}

				<div class="min-w-48">
					<SelectInput
						label="Status"
						records={auctionStatusSelect}
						labelKey="label"
						valueKey="value"
						type="single"
						disabled={auction.status === 'COMPLETED' || auction.status === 'CANCELLED'}
						bind:value={statusUpdateCmd.form.status}
						issues={statusUpdateCmd.errors.status?.message}
					/>
				</div>
				{#if auction.status == 'ACTIVE' || auction.status == 'PENDING'}
					<Button
						variant="secondary"
						onclick={statusUpdateCmd.submit}
						disabled={statusUpdateCmd.submitting}
					>
						{#if statusUpdateCmd.submitting}
							<Spinner />
						{:else}
							<Icon icon="mdi:content-save" />
						{/if}
						Update Status
					</Button>
				{/if}
			</div>
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
	{:else if auction.status !== 'ACTIVE'}
		<Empty
			title="Post Auction Editing Coming Soon"
			description="The ability to edit and manage lots will be available in future updates. Please check back later. I'm on a time crunch right now. -Marc"
		/>
	{:else}
		<!-- Lots Browser -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
			<!-- Current Lot Spotlight -->
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
				<div class="grid gap-3 rounded-xl border-2 border-primary/50 bg-card p-6">
					<!-- Lot Header -->
					{#if currentLot.anonLot}
						<div class="grid w-full gap-1 text-center font-bold text-primary">
							<span>
								The seller of this lot has chosen to remain anonymous. Ensure you respect their
								privacy during the auction process.
							</span>
							<span class="text-xs text-muted-foreground">
								You can hover over the Seller name to reveal the seller.
							</span>
						</div>
					{/if}

					<div class="mb-4 flex items-center justify-between border-b border-border/60 pb-4">
						<!-- Lot attributes -->
						<div class=" flex flex-wrap items-center gap-2">
							<Badge variant="outline" class="text-sm">{currentLot.status}</Badge>
							{#if currentLot.createdBy}
								<Badge variant="outline" class="text-sm">
									<Icon icon="mdi:user" class="size-4" />
									<span class={cn(currentLot.anonLot ? 'blur-md hover:blur-none' : '')}>
										Seller: {currentLot.createdBy.displayName}
									</span>
								</Badge>
							{/if}

							<Badge variant="outline" class="text-sm">Credits: {currentLot.creditsTo}</Badge>
						</div>

						<!-- Lot Action Dropdown -->
						<div class="flex items-center gap-2">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} size="sm" variant="outline">
											<Icon icon="mdi:dots-vertical" class="size-5" />
											<span>Actions</span>
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="max-w-48">
									<DropdownMenu.Group>
										<DropdownMenu.Item
											onclick={async () => {
												await broadcastLot({
													id: currentLot.id
												});
												toast.success('Lot broadcast initiated');
											}}
											disabled={currentLot.status !== 'SCHEDULED'}
										>
											<Icon icon="mdi:discord" />
											<span>Push to Discord</span>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={async () => {
												await goto(`/auction-house/lots/${currentLot.id}`);
											}}
										>
											<Icon icon="mdi:eye" />
											<span>View Lot</span>
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={() => {
												recordSaleCmd.form.lotId = currentLot.id;
												showLotSoldDialog = true;
											}}
											disabled={currentLot.status !== 'SCHEDULED'}
										>
											<Icon icon="mdi:check-circle-outline" />
											<span>Mark as Sold</span>
										</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</div>

					<!-- Details and Location -->
					<div class="flex w-full justify-between">
						<div class="grid w-full gap-4">
							<Item title="Details" variant="outline">
								{#snippet footer()}
									<span class="whitespace-pre-wrap">
										{currentLot.details}
									</span>
								{/snippet}
							</Item>
							{#if currentLot.location}
								<Item title="Location" variant="outline">
									{#snippet footer()}
										<span class="whitespace-pre-wrap">
											{currentLot.location}
										</span>
									{/snippet}
								</Item>
							{:else}
								<Empty
									title="No Location Provided"
									description="Guess this is just a magical lot?"
								/>
							{/if}
						</div>

						<div class="grid min-w-48 gap-3 text-right">
							<div>
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
							{#if currentLot.purchasePrice}
								<p
									class="flex items-center justify-end gap-1 text-xs text-muted-foreground uppercase"
								>
									<Coins class="size-3" />
									Purchased for
								</p>
								<p class="text-3xl font-bold text-primary">
									{toAbbrCurrency(currentLot.purchasePrice)}
								</p>
								<p class="text-sm text-muted-foreground">credits</p>
							{/if}
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

	{@render lotSoldDialog()}
</PageWrapper>

{#snippet lotSoldDialog()}
	<ResponsiveDialog title="Mark Lot as Sold" bind:open={showLotSoldDialog}>
		<div class="grid gap-3">
			<p class="text-sm text-muted-foreground">
				If the lot was won by a middle, select the approved middle below. Otherwise, select the
				winning bidder directly. Then, enter the winning bid amount to finalize the sale of the lot.
			</p>

			<SelectInput
				label="Winning Bidder"
				records={users}
				labelKey="displayName"
				valueKey="id"
				type="single"
				searchable
				allowDeselect
				bind:value={recordSaleCmd.form.winnerId}
				issues={recordSaleCmd.errors.winnerId?.message}
				onValueChange={(v) => {
					if (v === '') recordSaleCmd.form.winnerId = null;
				}}
			/>
			<SelectInput
				label="Winning Bidder (Middle)"
				records={users}
				labelKey="displayName"
				valueKey="id"
				type="single"
				searchable
				allowDeselect
				bind:value={recordSaleCmd.form.winnerMiddleId}
				issues={recordSaleCmd.errors.winnerMiddleId?.message}
				onValueChange={(v) => {
					if (v === '') recordSaleCmd.form.winnerMiddleId = null;
				}}
			/>
			<CreditInput
				label="Winning Bid"
				bind:value={recordSaleCmd.form.winningAmount}
				issues={recordSaleCmd.errors.winningAmount?.message}
			/>
		</div>

		{#snippet footer()}
			<div class="flex items-center gap-3">
				<Button size="sm" variant="secondary" onclick={() => (showLotSoldDialog = false)}>
					Cancel
				</Button>
				<Button
					size="sm"
					onclick={recordSaleCmd.submit}
					disabled={recordSaleCmd.submitting ||
						(!recordSaleCmd.form.winnerId &&
							!recordSaleCmd.form.winnerMiddleId &&
							!recordSaleCmd.form.winningAmount)}
				>
					{#if recordSaleCmd.submitting}
						<Spinner />
					{:else}
						<Icon icon="mdi:check-circle-outline" />
					{/if}
					<span>Record Sale</span>
				</Button>
			</div>
		{/snippet}
	</ResponsiveDialog>
{/snippet}

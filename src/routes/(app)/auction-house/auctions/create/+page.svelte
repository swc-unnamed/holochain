<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { AuctionType } from '$lib/generated/prisma/enums.js';
	import { createAuction } from '$lib/remote/auction-house/auctions/create-auction.remote';
	import { createAuctionSchema } from '$lib/remote/auction-house/auctions/create-auction.schema';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { toast } from 'svelte-sonner';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { toLocalCurrency } from '$lib/utils/helpers/shared/currency.js';

	// Icons
	import {
		Rocket,
		Package,
		CalendarClock,
		FileText,
		Search,
		CircleCheck,
		User,
		MapPin,
		Coins,
		Hash,
		Eye,
		CircleAlert
	} from '@lucide/svelte';

	let { data } = $props();
	let availLots = $derived(data.lots);

	// Type guards for discriminated union
	function isAnonLot(
		lot: (typeof availLots)[number]
	): lot is (typeof availLots)[number] & { anonid: string; creatorKarma: number; createdBy: null } {
		return lot.anonLot === true;
	}

	// Search/filter state
	let searchQuery = $state('');
	let activeTab = $state('details');

	const cmd = new CommandForm(createAuctionSchema, {
		command: createAuction,
		initial: () => ({
			type: AuctionType.LIVE,
			title: '',
			description: '',
			start: '',
			end: '',
			lots: []
		}),
		onSuccess: async (res) => {
			toast.success('Auction created successfully', {
				description: 'Notifications will be sent out shortly'
			});

			await goto(`/auction-house/auctions/${res.id}`);
		},
		onError(err) {
			console.error(err);
			toast.error('Failed to create Auction');
		}
	});

	// Computed values
	const filteredLots = $derived.by(() => {
		if (!searchQuery.trim()) return availLots;

		const query = searchQuery.toLowerCase();
		return availLots.filter((lot) => {
			const lotNumber = `#${lot.lotNumber}`.toLowerCase();
			const title = lot.title.toLowerCase();
			const creatorName = isAnonLot(lot)
				? lot.anonid?.toLowerCase() || ''
				: lot.createdBy?.displayName?.toLowerCase() || '';

			return lotNumber.includes(query) || title.includes(query) || creatorName.includes(query);
		});
	});

	const selectedLots = $derived.by(() => {
		return availLots.filter((lot) => cmd.form.lots?.includes(lot.id));
	});

	const selectedLotsCount = $derived(cmd.form.lots?.length || 0);

	const totalItems = $derived.by(() => {
		return selectedLots.reduce((sum, lot) => {
			return sum + lot.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
		}, 0);
	});

	function toggleLot(lotId: string) {
		const isSelected = cmd.form.lots?.includes(lotId);
		if (isSelected) {
			cmd.set({
				...cmd.form,
				lots: cmd.form.lots?.filter((id) => id !== lotId)
			});
		} else {
			cmd.set({
				...cmd.form,
				lots: [...(cmd.form.lots || []), lotId]
			});
		}
	}

	function isLotSelected(lotId: string) {
		return cmd.form.lots?.includes(lotId) || false;
	}

	function canProceedToManifest() {
		return (cmd.form.title?.length ?? 0) >= 5 && (cmd.form.description?.length ?? 0) >= 1;
	}

	function canProceedToReview() {
		return canProceedToManifest() && selectedLotsCount > 0;
	}
</script>

<PageWrapper title="Create Auction">
	<CardWrapper title="Create Auction">
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="details" class="flex items-center gap-2">
					<FileText class="size-4" />
					<span>Details</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="lots" class="flex items-center gap-2">
					<Package class="size-4" />
					<span>Lots</span>
					{#if selectedLotsCount > 0}
						<Badge variant="secondary" class="ml-1 hidden sm:inline-flex">{selectedLotsCount}</Badge
						>
					{/if}
				</Tabs.Trigger>
				<Tabs.Trigger value="review" class="flex items-center gap-2">
					<Rocket class="size-4" />
					<span>Review</span>
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="details" class="mt-6 space-y-6">
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<FileText class="mt-1 size-5 text-muted-foreground" />
						<div class="flex-1 space-y-1">
							<h3 class="text-lg font-semibold">Auction Information</h3>
							<p class="text-sm text-muted-foreground">
								Set up the basic details for your auction transmission
							</p>
						</div>
					</div>

					<Separator />

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<SelectInput
								type="single"
								label="Auction Type"
								bind:value={cmd.form.type}
								records={[{ label: 'Live Auction', value: AuctionType['LIVE'] }]}
								valueKey="value"
								labelKey="label"
								issues={cmd.errors.type?.message}
							/>
						</div>

						<div class="sm:col-span-2">
							<FieldInput
								label="Auction Title"
								placeholder="Enter a descriptive title..."
								bind:value={cmd.form.title}
								issues={cmd.errors.title?.message}
								required
							/>
						</div>

						<div class="sm:col-span-2">
							<TextareaInput
								label="Description"
								placeholder="Provide details about this auction..."
								bind:value={cmd.form.description}
								issues={cmd.errors.description?.message}
								required
							/>
						</div>

						<div class="flex items-start gap-3 sm:col-span-2">
							<CalendarClock class="mt-1 size-5 text-muted-foreground" />
							<div class="flex-1 space-y-1">
								<h4 class="text-sm font-semibold">Schedule (Optional)</h4>
								<p class="text-xs text-muted-foreground">
									Set start and end times, or leave blank for manual control
								</p>
							</div>
						</div>

						<FieldInput
							label="Start Date & Time"
							type="datetime-local"
							bind:value={cmd.form.start}
							issues={cmd.errors.start?.message}
						/>

						<FieldInput
							label="End Date & Time"
							type="datetime-local"
							bind:value={cmd.form.end}
							issues={cmd.errors.end?.message}
						/>
					</div>

					<div class="flex justify-end pt-4">
						<Button onclick={() => (activeTab = 'lots')} class="gap-2">
							Continue to Lot Selection
							<Package class="size-4" />
						</Button>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="lots" class="mt-6 space-y-6">
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<Package class="mt-1 size-5 text-muted-foreground" />
						<div class="flex-1 space-y-1">
							<h3 class="text-lg font-semibold">Select Lots for Auction</h3>
							<p class="text-sm text-muted-foreground">
								Choose which cargo lots to include in this transmission
							</p>
						</div>
						<Badge variant="outline" class="gap-1.5">
							<CircleCheck class="size-3" />
							{selectedLotsCount} selected
						</Badge>
					</div>

					<Separator />

					<!-- Search -->
					<div class="relative">
						<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search by lot number, title, or seller..."
							bind:value={searchQuery}
							class="pl-10"
						/>
					</div>

					<!-- Lots List -->
					<ScrollArea class="h-[400px] rounded-md border p-4">
						<div class="space-y-3">
							{#if filteredLots.length === 0}
								<div class="flex flex-col items-center justify-center py-12 text-center">
									<CircleAlert class="mb-3 size-12 text-muted-foreground" />
									<h4 class="text-sm font-semibold">No lots found</h4>
									<p class="text-sm text-muted-foreground">
										{searchQuery ? 'Try adjusting your search' : 'No lots available'}
									</p>
								</div>
							{:else}
								{#each filteredLots as lot (lot.id)}
									{@const itemCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)}
									{@const isSelected = isLotSelected(lot.id)}
									<button
										type="button"
										onclick={() => toggleLot(lot.id)}
										class="flex w-full items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:bg-accent/50 {isSelected
											? 'border-primary bg-accent/30'
											: ''}"
									>
										<Checkbox checked={isSelected} class="mt-1" />

										<div class="min-w-0 flex-1 space-y-3">
											<div class="flex flex-wrap items-start justify-between gap-2">
												<div class="flex items-center gap-2">
													<Badge variant="outline" class="gap-1 whitespace-nowrap">
														<Hash class="size-3" />
														{lot.lotNumber}
													</Badge>
													<h4 class="line-clamp-1 text-sm font-semibold">{lot.title}</h4>
												</div>
												<Badge variant="secondary" class="gap-1 whitespace-nowrap">
													<Package class="size-3" />
													{itemCount}
													{itemCount === 1 ? 'item' : 'items'}
												</Badge>
											</div>

											<div class="space-y-2">
												<div>
													<p class="text-xs font-medium text-muted-foreground">Description:</p>
													<p class="text-xs whitespace-pre-wrap">{lot.details}</p>
												</div>

												<div>
													<p class="text-xs font-medium text-muted-foreground">Location:</p>
													<p class="text-xs whitespace-pre-wrap">{lot.location}</p>
												</div>

												<div>
													<p class="text-xs font-medium text-muted-foreground">Items:</p>
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
											</div>

											<div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
												<div class="flex items-center gap-1.5">
													<Coins class="size-3.5" />
													<span>{toLocalCurrency(lot.startPrice)} credits</span>
												</div>
												{#if isAnonLot(lot)}
													<div class="flex items-center gap-1.5">
														<Eye class="size-3.5" />
														<span>Anon: {lot.anonid}</span>
													</div>
												{:else if lot.createdBy?.displayName}
													<div class="flex items-center gap-1.5">
														<User class="size-3.5" />
														<span>{lot.createdBy.displayName}</span>
													</div>
												{/if}
											</div>
										</div>
									</button>
								{/each}
							{/if}
						</div>
					</ScrollArea>

					<div class="flex items-center justify-between gap-3 pt-4">
						<Button variant="outline" onclick={() => (activeTab = 'details')}>Back</Button>
						<Button onclick={() => (activeTab = 'review')} class="gap-2">
							Review Auction
							<Rocket class="size-4" />
						</Button>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="review" class="mt-6 space-y-6">
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<Rocket class="mt-1 size-5 text-muted-foreground" />
						<div class="flex-1 space-y-1">
							<h3 class="text-lg font-semibold">Review & Launch</h3>
							<p class="text-sm text-muted-foreground">
								Verify all details before initiating the auction transmission
							</p>
						</div>
					</div>

					<Separator />

					<div class="space-y-3 rounded-lg border bg-muted/30 p-4">
						<div class="flex items-center gap-2">
							<FileText class="size-4 text-muted-foreground" />
							<h4 class="font-semibold">Auction Details</h4>
						</div>
						<div class="space-y-2 text-sm">
							<div class="grid grid-cols-[120px_1fr] gap-2">
								<span class="text-muted-foreground">Title:</span>
								<span class="font-medium">{cmd.form.title}</span>
							</div>
							<div class="grid grid-cols-[120px_1fr] gap-2">
								<span class="text-muted-foreground">Description:</span>
								<span>{cmd.form.description}</span>
							</div>
							<div class="grid grid-cols-[120px_1fr] gap-2">
								<span class="text-muted-foreground">Type:</span>
								<Badge variant="outline" class="w-fit">Live Auction</Badge>
							</div>
							{#if cmd.form.start && cmd.form.end}
								<div class="grid grid-cols-[120px_1fr] gap-2">
									<span class="text-muted-foreground">Schedule:</span>
									<div class="space-y-1">
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">Start:</span>
											<span>{new Date(cmd.form.start).toLocaleString()}</span>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">End:</span>
											<span>{new Date(cmd.form.end).toLocaleString()}</span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Lots Summary -->
					<div class="space-y-3 rounded-lg border bg-muted/30 p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Package class="size-4 text-muted-foreground" />
								<h4 class="font-semibold">Selected Cargo</h4>
							</div>
							<div class="flex gap-2">
								<Badge variant="secondary" class="gap-1">
									{selectedLotsCount}
									{selectedLotsCount === 1 ? 'lot' : 'lots'}
								</Badge>
								<Badge variant="secondary" class="gap-1">
									{totalItems}
									{totalItems === 1 ? 'item' : 'items'}
								</Badge>
							</div>
						</div>

						<ScrollArea class="max-h-[200px]">
							<div class="space-y-2">
								{#each selectedLots as lot (lot.id)}
									{@const itemCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)}
									<div class="flex items-start gap-3 rounded-md border bg-background p-3 text-sm">
										<Badge variant="outline" class="mt-0.5 gap-1 whitespace-nowrap">
											<Hash class="size-3" />
											{lot.lotNumber}
										</Badge>
										<div class="min-w-0 flex-1">
											<h5 class="font-medium">{lot.title}</h5>
											<div class="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
												<span class="flex items-center gap-1">
													<Package class="size-3" />
													{itemCount}
													{itemCount === 1 ? 'item' : 'items'}
												</span>
												<span class="flex items-center gap-1">
													<Coins class="size-3" />
													{toLocalCurrency(lot.startPrice)} cr
												</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</ScrollArea>
					</div>

					{#if cmd.errors.lots?.message}
						<div
							class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<CircleAlert class="size-4" />
							{cmd.errors.lots.message}
						</div>
					{/if}

					<div class="flex items-center justify-between gap-3 pt-4">
						<Button variant="outline" onclick={() => (activeTab = 'lots')}>Back</Button>
						<Button
							onclick={cmd.submit}
							disabled={cmd.submitting || selectedLotsCount === 0}
							class="gap-2"
						>
							{#if cmd.submitting}
								Launching...
							{:else}
								<Rocket class="size-4" />
								Launch Auction
							{/if}
						</Button>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</CardWrapper>
</PageWrapper>

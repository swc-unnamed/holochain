<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { createAuction } from '$lib/remote/auction-house/auctions/create-auction.remote';
	import { createAuctionSchema } from '$lib/remote/auction-house/auctions/create-auction.schema';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { toast } from 'svelte-sonner';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { toLocalCurrency } from '$lib/utils/helpers/shared/currency.js';
	import { Package, Search, CircleCheck, User, Coins, Hash, Eye, Plus } from '@lucide/svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';

	let { data } = $props();
	let availLots = $derived(data.lots);

	// Type guards for discriminated union
	function isAnonLot(
		lot: (typeof availLots)[number]
	): lot is (typeof availLots)[number] & { anonid: string; creatorKarma: number; createdBy: null } {
		return lot.anonLot === true;
	}

	let searchQuery = $state('');

	const cmd = new CommandForm(createAuctionSchema, {
		command: createAuction,
		initial: () => ({
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

	const selectedLotsCount = $derived(cmd.form.lots?.length || 0);

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
</script>

<PageWrapper title="Create Auction">
	<CardWrapper
		title="Create a new Auction"
		description="Fill out the details below, keep in mind this is for Live Auctions only."
	>
		<div class="grid gap-3">
			<FieldInput
				label="Auction Title"
				placeholder="Enter a descriptive title..."
				bind:value={cmd.form.title}
				issues={cmd.errors.title?.message}
				required
			/>
			<TextareaInput
				label="Description"
				placeholder="Provide details about this auction..."
				bind:value={cmd.form.description}
				issues={cmd.errors.description?.message}
				required
			/>
			<FieldInput
				label="Start Date & Time"
				type="datetime-local"
				bind:value={cmd.form.start}
				issues={cmd.errors.start?.message}
			/>
			<Separator />

			<!-- Lot Selection -->
			<div class="grid gap-4">
				<div class="flex items-start gap-3">
					<Badge variant="outline" class="gap-1.5">
						<CircleCheck class="size-3" />
						{selectedLotsCount} selected
					</Badge>
				</div>

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
				<div class="space-y-3">
					{#if filteredLots.length === 0}
						<Empty title="No Lots Found" />
					{:else}
						{#each filteredLots as lot (lot.id)}
							{@const itemCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)}
							{@const isSelected = isLotSelected(lot.id)}
							<button
								type="button"
								onclick={() => toggleLot(lot.id)}
								class="flex w-full items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary {isSelected
									? 'border-primary bg-accent/30'
									: ''}"
							>
								<Checkbox checked={isSelected} class="mt-1" />

								<div class="min-w-0 flex-1 space-y-3">
									<div class="flex flex-wrap items-start justify-between gap-2">
										<div class="flex items-center gap-2">
											<Badge variant="outline">
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
			</div>
		</div>

		{#snippet footer()}
			<div class="flex w-full justify-end gap-2">
				<Button onclick={cmd.submit} disabled={cmd.submitting}>
					{#if cmd.submitting}
						<Spinner />
					{:else}
						<Plus />
					{/if}
					<span>Create Auction</span>
				</Button>
			</div>
		{/snippet}
	</CardWrapper>
</PageWrapper>

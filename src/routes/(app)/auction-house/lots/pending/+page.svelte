<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { toAbbrCurrency } from '$lib/utils/helpers/shared/currency';
	import Icon from '@iconify/svelte';
	import * as AvatarGroup from '$lib/components/custom/avatar-group';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { toast } from 'svelte-sonner';
	import { assignLotAuction } from '$lib/remote/auction-house/lot/assign-lot-auction.remote.js';

	let { data } = $props();
	let lots = $derived(data.lots);
	let showAssignAuctionDialog = $state(false);
	let selectedLotId = $state<string | null>(null);
	let selectedAssignAuctionId = $state<string | null>(null);
</script>

<PageWrapper title="Lots">
	<CardWrapper
		title="Available Lots"
		description="Lots that have not been scheduled for an Auction yet."
	>
		{#if lots.length < 1}
			<Empty title="No Pending Lots" />
		{:else}
			<div class="grid gap-3">
				{#each lots as lot (lot.id)}
					<div class="grid gap-3 rounded-xl border p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span>Lot {lot.lotNumber}</span>
								<Badge variant="secondary">{lot.status}</Badge>
							</div>
							<div class="flex items-center gap-2">
								<Button
									size="sm"
									variant="secondary"
									onclick={() => {
										selectedLotId = lot.id;
										showAssignAuctionDialog = true;
									}}
								>
									Assign Auction
								</Button>
								<Button size="sm" variant="outline" href="/auction-house/lots/{lot.id}">
									View Lot
								</Button>
							</div>
						</div>

						<div class="grid gap-0.5">
							<h5>{lot.title}</h5>
							<span class="text-sm text-muted-foreground">
								Staring Bid: {toAbbrCurrency(lot.startPrice)} Cr
							</span>
						</div>

						<Separator />

						<div class="grid gap-2">
							<span class="text-sm font-bold uppercase">Details</span>
							<p class="text-sm whitespace-pre-wrap">{lot.details}</p>
						</div>

						<Separator />

						<div class="grid gap-2">
							<span class="text-sm font-bold uppercase">Location</span>
							<p class="text-sm whitespace-pre-wrap">{lot.location}</p>
						</div>

						<Separator />

						<div class="grid gap-2">
							<span class="text-sm font-bold uppercase">Items</span>
							<AvatarGroup.Root>
								<Tooltip.Provider>
									{#each lot.items.slice(0, 3) as item}
										<Tooltip.Root delayDuration={100}>
											<Tooltip.Trigger>
												<AvatarGroup.Member>
													<AvatarGroup.MemberImage src={item.entity.imageSmall} alt={'entity'} />
													<AvatarGroup.MemberFallback>?</AvatarGroup.MemberFallback>
												</AvatarGroup.Member>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{item.entity.name}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/each}
								</Tooltip.Provider>
								{#if lot.items.length > 3}
									<AvatarGroup.Etc plus={lot.items.length - 3} />
								{/if}
							</AvatarGroup.Root>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardWrapper>

	{@render assignAuctionDialog()}
</PageWrapper>

{#snippet assignAuctionDialog()}
	<ResponsiveDialog
		title="Assign Auction"
		bind:open={showAssignAuctionDialog}
		onOpenChange={(v) => {
			if (!v) {
				selectedLotId = null;
			}
		}}
	>
		<div class="grid gap-3">
			{#if data.openAuctions.length < 1}
				<Empty
					title="No Auctions Available"
					description="No auctions were found in Pending or Open status."
				/>
			{:else}
				<SelectInput
					type="single"
					label="Select Auction"
					records={data.openAuctions}
					bind:value={selectedAssignAuctionId}
					labelKey="title"
					valueKey="id"
				/>
			{/if}
		</div>

		{#snippet footer()}
			{#if data.openAuctions.length > 0}
				<Button
					onclick={async () => {
						if (selectedLotId && selectedAssignAuctionId) {
							const res = await assignLotAuction({
								lotId: selectedLotId,
								auctionId: selectedAssignAuctionId
							});

							if (res.success) {
								toast.success('Lot assigned to auction successfully.');
								showAssignAuctionDialog = false;
								selectedAssignAuctionId = null;
								selectedLotId = null;

								await invalidate('ah:lots:pending');
							} else {
								toast.error('Failed to assign lot to auction: ' + res.error);
							}
						} else {
							toast.error('Please select an auction to assign.');
							return;
						}
					}}
				>
					Assign
				</Button>
			{/if}
		{/snippet}
	</ResponsiveDialog>
{/snippet}

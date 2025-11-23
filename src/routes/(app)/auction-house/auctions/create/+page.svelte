<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AuctionType } from '$lib/generated/prisma/enums.js';
	import { createAuction } from '$lib/remote/auction-house/auctions/create-auction.remote';
	import { createAuctionSchema } from '$lib/remote/auction-house/auctions/create-auction.schema';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let availLots = $derived(data.lots);

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
</script>

<PageWrapper title="Create Auction">
	<CardWrapper title="Create Auction">
		{#snippet header()}
			<div>
				<SelectInput
					type="single"
					label="Auction Type"
					bind:value={cmd.form.type}
					records={[{ label: 'Live', value: AuctionType['LIVE'] }]}
					valueKey="value"
					labelKey="label"
					issues={cmd.errors.type?.message}
				/>
			</div>
		{/snippet}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<div class="grid gap-3">
				<FieldInput label="Title" bind:value={cmd.form.title} issues={cmd.errors.title?.message} />
				<TextareaInput
					label="Description"
					bind:value={cmd.form.description}
					issues={cmd.errors.description?.message}
				/>
			</div>
			<div class="grid gap-3">
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
		</div>

		{#snippet footer()}
			<div class="flex w-full justify-end">
				<Button size="sm" disabled={!cmd.form.lots?.length} onclick={cmd.submit}>
					Create Auction
				</Button>
			</div>
		{/snippet}
	</CardWrapper>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		<div>
			<CardWrapper title="Available Lots">
				<div class="grid gap-3">
					<h3>Available Lots</h3>
					{#each availLots as lot}
						{@const isSelected = cmd.form.lots?.includes(lot.id)}
						{#if !isSelected}
							<Item
								variant="outline"
								title={`#${lot.lotNumber}: ${lot.title}`}
								description={lot.details}
								action={{
									text: 'Add to Auction',
									variant: 'outline',
									onClick: () => {
										cmd.set({
											...cmd.form,
											lots: [...(cmd.form.lots || []), lot.id]
										});
									}
								}}
							/>
						{/if}
					{/each}
				</div>
			</CardWrapper>
		</div>

		<div>
			<CardWrapper title="Selected Lots">
				<div class="grid gap-3">
					{#if cmd.form.lots?.length}
						{#each cmd.form.lots as itemId}
							{@const lot = availLots.find((l) => l.id === itemId)}
							{#if lot}
								<Item
									variant="outline"
									title={`#${lot.lotNumber}: ${lot.title}`}
									description={lot.details}
									action={{
										text: 'Remove from Auction',
										variant: 'outline',
										onClick: () => {
											cmd.set({
												...cmd.form,
												lots: cmd.form.lots?.filter((id) => id !== lot.id)
											});
										}
									}}
								/>
							{:else}
								<Empty
									variant="error"
									title="Error"
									description="Something in possible happened. Realod the page and try again."
								/>
							{/if}
						{/each}
					{:else}
						<Empty title="No Lots Selected" description="Select a lot to add it to this Auction" />
					{/if}
				</div>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import CreditInput from '$lib/components/custom/fields/credit-input/credit-input.svelte';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import { toast } from 'svelte-sonner';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { createLotSchema } from '$lib/remote/auction-house/lot/create-lot.schema.js';
	import { createLot } from '$lib/remote/auction-house/lot/create-lot.remote.js';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let addLotItem = $state({
		entityId: null as string | null,
		itemName: '',
		quantity: 1,
		batch: false,
		custom: false,
		customImageUrl: null as string | null
	});

	const createLotCmd = new CommandForm(createLotSchema, {
		command: createLot,
		onSuccess: async (res) => {
			toast.success('Lot Created Successfully');
			await goto(`/auction-house/lots/${res.id}`);
		},
		onError: () => {
			toast.error('Failed to create the Lot, try again');
		},
		initial: () => ({
			title: '',
			details: '',
			location: '',
			anonLot: false,
			creditsTo: data.user.displayName,
			startPrice: '100,000',
			items: []
		})
	});

	function importFromCombine() {
		toast('Not Implemented Yet', {
			description:
				'Your interest has been noted, we will announce when this feature is available on the Holochain.'
		});
	}

	function addItem() {
		if (!addLotItem.entityId) {
			toast.error('Please select an Entity to add');
			return;
		}

		const foundEntity = data.entities.find((e) => e.id === addLotItem.entityId);
		if (!foundEntity) {
			toast.error('Selected Entity not found');
			return;
		}

		createLotCmd.form.items?.push({
			entityId: addLotItem.entityId,
			name: foundEntity.name,
			quantity: addLotItem.quantity,
			batch: addLotItem.batch,
			custom: addLotItem.custom,
			customImageUrl: addLotItem.customImageUrl
		});

		// Reset the add item form
		addLotItem = {
			entityId: null,
			itemName: '',
			quantity: 1,
			batch: false,
			custom: false,
			customImageUrl: null
		};
	}
</script>

<PageWrapper title="Create a Lot">
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		<div class="grid gap-3">
			<CardWrapper title="Create an Auction House Lot">
				<div class="grid gap-3">
					<FieldInput label="Title" bind:value={createLotCmd.form.title} />
					<TextareaInput
						label="Details"
						description="Think of this as your sales pitch"
						bind:value={createLotCmd.form.details}
					/>
					<TextareaInput label="Location" bind:value={createLotCmd.form.location} />

					<SwitchInput
						label="Anonymous Listing"
						description="Hide your identity from bidders a middle is highly recommended for maximum privacy"
						bind:checked={createLotCmd.form.anonLot}
					/>

					<FieldInput label="Send Credits To" bind:value={createLotCmd.form.creditsTo} />

					<CreditInput label="Starting Bid" bind:value={createLotCmd.form.startPrice} />
				</div>

				{#snippet footer()}
					<div class="flex w-full justify-end">
						<Button onclick={createLotCmd.submit} disabled={createLotCmd.submitting}>
							<Icon icon="mdi:plus" />
							<span>Create Lot</span>
						</Button>
					</div>
				{/snippet}
			</CardWrapper>

			<CardWrapper title="Add Lot Item">
				{#snippet header()}
					<Button size="sm" variant="ghost" onclick={importFromCombine}>Import from Combine</Button>
				{/snippet}
				<div class="grid gap-3">
					<SelectInput
						searchable
						label="Entity"
						type="single"
						records={data.entities}
						valueKey="id"
						labelKey="name"
						bind:value={addLotItem.entityId}
					/>
					<FieldInput type="number" label="Quantity" min="1" bind:value={addLotItem.quantity} />
					<SwitchInput label="Batched Item" bind:checked={addLotItem.batch} />
					<SwitchInput label="Custom Item" bind:checked={addLotItem.custom} />

					{#if addLotItem.custom}
						<FieldInput
							label="Custom Image URL"
							placeholder="https://example.com/image.png"
							bind:value={addLotItem.customImageUrl}
						/>
					{/if}
				</div>

				{#snippet footer()}
					<div class="flex w-full items-center justify-end">
						<Button onclick={addItem} variant="secondary">
							<Icon icon="mdi:package" />
							<span>Add to Lot</span>
						</Button>
					</div>
				{/snippet}
			</CardWrapper>
		</div>

		<div>
			<CardWrapper title="Items">
				<div class="grid gap-3">
					{#if createLotCmd.form.items && createLotCmd.form.items.length < 1}
						<Empty
							title="No Items Added"
							description="You have not added any items to this lot yet."
						/>
					{:else}
						{#each createLotCmd.form.items as item, index}
							<div class="flex items-center justify-between rounded-md border border-border p-3">
								<div class="grid gap-1">
									<div class="flex items-center gap-2">
										<img
											src={item.custom && item.customImageUrl
												? item.customImageUrl
												: data.entities.find((e) => e.id === item.entityId)?.imageSmall}
											alt={item.name}
											class="h-8 w-8 rounded-md object-cover"
										/>
										<div class="font-medium">{item.name}</div>
									</div>
									<div class="text-sm text-muted-foreground">
										Quantity: {item.quantity}
										{item.batch ? '(Batched)' : ''}
										{item.custom ? '(Custom)' : ''}
									</div>
								</div>
								<div>
									<Button
										size="sm"
										variant="destructive"
										onclick={() => createLotCmd.form.items?.splice(index, 1)}
									>
										Remove
									</Button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

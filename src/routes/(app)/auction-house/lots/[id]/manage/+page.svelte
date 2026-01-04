<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { getUserLot } from '$lib/remote/auction-house/lot/get-user-lot.remote';
	import { editLot } from '$lib/remote/auction-house/lot/edit/edit-lot.remote.js';
	import { editLotSchema } from '$lib/remote/auction-house/lot/edit/edit-lot.schema';
	import CreditInput from '$lib/components/custom/fields/credit-input/credit-input.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import Icon from '@iconify/svelte';
	import { getUserList } from '$lib/remote/users/get-user-list.remote.js';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import * as Tabs from '$lib/components/custom/underline-tabs';
	import { Separator } from '$lib/components/ui/separator';
	import ItemSwitch from '$lib/components/custom/item-switch/item-switch.svelte';
	import { lotStatusSelect } from '$lib/types/auction-house/lot-status.js';
	import Item from '$lib/components/custom/item/item.svelte';
	import { addItemSchema } from '$lib/remote/auction-house/lot/edit/add-item.schema.js';
	import { addItem } from '$lib/remote/auction-house/lot/edit/add-item.remote.js';
	import { deleteLotItemSchema } from '$lib/remote/auction-house/lot-item/delete-lot-item.schema.js';
	import { deleteItem } from '$lib/remote/auction-house/lot/edit/delete-item.remote.js';
	import { deleteItemSchema } from '$lib/remote/auction-house/lot/edit/delete-item.schema.js';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';

	let { data } = $props();
	let lot = $derived(await getUserLot({ id: data.id }));
	let entities = $derived(data.entities);
	let users = $derived(await getUserList());
	let showDeleteItemDialog = $state(false);
	let showAddItemDialog = $state(false);

	const cmd = new CommandForm(editLotSchema, {
		command: editLot,
		initial: () => ({
			id: lot.id,
			title: lot.title,
			details: lot.details,
			location: lot.location,
			anonLot: lot.anonLot,
			status: lot.status,
			startPrice: lot.startPrice,
			createdById: lot.createdById || '',
			creditsTo: lot.creditsTo || 'Unnamed Market',
			purchasedById: lot.purchasedById,
			purchasedByMiddle: lot.purchasedByMiddle,
			purchasePrice: lot.purchasePrice
		}),
		onSuccess: async () => {
			toast.success('Lot updated');
		},
		onError: () => {
			toast.error('Failed to update lot');
		}
	});

	const addItemCmd = new CommandForm(addItemSchema, {
		command: addItem,
		onSuccess: () => {
			toast.success('Item added to lot');
			showAddItemDialog = false;
		},
		onError: () => {
			toast.error('Failed to add item to lot');
			console.error(addItemCmd.errors);
		},
		initial: () => ({
			lotId: lot.id,
			entityId: '',
			name: '',
			quantity: 1,
			batch: false,
			custom: false,
			uuu: true,
			customImageUrl: null
		}),
		reset: 'onSuccess'
	});

	const deleteItemCmd = new CommandForm(deleteItemSchema, {
		command: deleteItem,
		onSuccess: () => {
			toast.success('Item removed from lot');
			showDeleteItemDialog = false;
		},
		onError: () => {
			toast.error('Failed to remove item from lot');
		},
		initial: () => ({
			lotId: lot.id
		}),
		reset: 'onSuccess'
	});

	let canSave = $state(true);
	let requirePurchaseData = $state(false);

	$effect(() => {
		if (
			cmd.form.status === 'SOLD' ||
			(cmd.form.status === 'COMPLETED' && (!cmd.form.purchasePrice || !cmd.form.purchasedById))
		) {
			canSave = false;
			requirePurchaseData = true;
		} else {
			canSave = true;
		}
	});
</script>

<PageWrapper title={`Manage ${lot.title}`}>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-6">
		<!-- Lot Meta -->
		<div class="md:col-span-4">
			<CardWrapper title="Manage Lot: #{lot.lotNumber}">
				{#snippet header()}
					<div class="flex items-center gap-2">
						<Badge>{lot.status}</Badge>
						<div class="text-sm text-muted-foreground">Lot #{lot.lotNumber}</div>
					</div>
				{/snippet}
				<Tabs.Root value="sales">
					<Tabs.List>
						<Tabs.Trigger value="sales">Sales Data</Tabs.Trigger>
						<Tabs.Trigger value="details">Lot Details</Tabs.Trigger>
						<Tabs.Trigger value="history">History</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="sales">
						<div class="grid gap-3">
							<h3>Seller Data</h3>

							<SelectInput
								type="single"
								searchable
								label="Created By"
								bind:value={cmd.form.createdById}
								records={users}
								labelKey="displayName"
								valueKey="id"
							/>
							<FieldInput label="Credits To" value={lot.creditsTo} readonly />

							<CreditInput label="Starting Price" bind:value={cmd.form.startPrice} />

							<Separator />

							<h4>Purchase Data</h4>
							<ItemSwitch
								label="Purchased by Middle"
								description="Indicates whether the lot was purchased through an intermediary. In order for the correct purchase data, make sure to set the correct purchaser below."
								bind:checked={cmd.form.purchasedByMiddle}
							/>

							<SelectInput
								type="single"
								searchable
								label="Purchased By"
								bind:value={cmd.form.purchasedById}
								records={users}
								labelKey="displayName"
								valueKey="id"
								required={requirePurchaseData}
							/>

							<CreditInput
								label="Purchase Price"
								bind:value={cmd.form.purchasePrice}
								required={requirePurchaseData}
							/>

							<Separator />

							<h4>Meta Data</h4>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<SelectInput
									type="single"
									label="Status"
									bind:value={cmd.form.status}
									records={lotStatusSelect}
									labelKey="label"
									valueKey="value"
								/>
								<FieldInput label="Created At" value={standardDateFormat(lot.createdAt)} readonly />
								<FieldInput
									label="Last Updated"
									value={standardDateFormat(lot.updatedAt)}
									readonly
								/>
							</div>
						</div>
					</Tabs.Content>

					<Tabs.Content value="details">
						<div class="grid gap-3">
							<FieldInput label="Title" bind:value={cmd.form.title} required />
							<TextareaInput
								label="Details"
								description="Think of this as your sales pitch"
								bind:value={cmd.form.details}
								required
							/>
							<TextareaInput label="Location" bind:value={cmd.form.location} required />

							<SwitchInput
								label="Anonymous Listing"
								description="Hide your identity from bidders"
								bind:checked={cmd.form.anonLot}
							/>

							<FieldInput label="Status" value={cmd.form.status} readonly />
						</div>
					</Tabs.Content>

					<Tabs.Content value="history">
						<div class="grid gap-1">
							{#each lot.history as entry (entry.id)}
								<Item description={standardDateFormat(entry.createdAt)} variant="outline">
									{#snippet title()}
										<span class="text-sm">{entry.event}</span>
									{/snippet}
								</Item>
							{/each}
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{#snippet footer()}
					<div class="flex w-full items-center justify-end gap-2">
						<div class="flex items-center gap-2">
							<Button
								variant="secondary"
								onclick={async () => {
									history.back();
								}}
							>
								<Icon icon="mdi:arrow-back" />
								Go back
							</Button>
							<Button onclick={cmd.submit} disabled={cmd.submitting || !canSave}>
								{#if cmd.submitting}
									Saving…
								{:else}
									Save Changes
								{/if}
							</Button>
						</div>
					</div>
				{/snippet}
			</CardWrapper>
		</div>

		<!-- Lot Items -->
		<div class="md:col-span-2">
			<CardWrapper title="Items">
				{#snippet header()}
					{#if lot.status == 'SUBMITTED' || lot.status === 'SCHEDULED'}
						<Button size="sm" variant="secondary" onclick={() => (showAddItemDialog = true)}>
							<Icon icon="mdi:plus" />
							Add Item
						</Button>
					{/if}
				{/snippet}
				<div class="grid gap-3">
					{#if lot.items?.length < 1}
						<Empty title="No items" description="This lot has no items." />
					{:else}
						<div class="grid grid-cols-1 gap-3">
							{#each lot.items as item (item.id)}
								<div class="grid grid-cols-2 gap-2 rounded-md border p-2">
									<div class="grid gap-1">
										<img
											src={item.entity?.imageLarge ?? item.customImageUrl ?? ''}
											alt={item.name}
											class="aspect-square h-40 rounded-md border object-cover"
										/>
									</div>

									<div class="grid gap-2">
										<div class="font-medium">{item.name}</div>
										<div class="text-sm text-muted-foreground">Qty: {item.quantity}</div>
										<div class="flex flex-wrap items-center gap-2">
											{#if item.custom}
												<Badge>Custom</Badge>
											{/if}
											{#if item.batch}
												<Badge>Batch</Badge>
											{/if}
											{#if item.uuu}
												<Badge>UUU</Badge>
											{/if}
										</div>
									</div>

									<Button
										class="col-span-2"
										size="sm"
										variant="ghost"
										onclick={() => {
											deleteItemCmd.form.itemId = item.id;
											showDeleteItemDialog = true;
										}}
									>
										Remove Item
									</Button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</CardWrapper>
		</div>
	</div>

	{@render deleteItemDialog()}
	{@render addItemDialog()}
</PageWrapper>

{#snippet deleteItemDialog()}
	<ResponsiveDialog title="Delete Item" bind:open={showDeleteItemDialog}>
		<p>Are you sure you want to delete this item from the lot? This action cannot be undone.</p>
		<TextareaInput
			label="Reason for Deletion"
			bind:value={deleteItemCmd.form.reason}
			issues={deleteItemCmd.errors.reason?.message}
			description="This will be placed into the Lot history."
			required
			disabled={deleteItemCmd.submitting}
		/>

		{#snippet footer()}
			<Button
				size="sm"
				onclick={() => {
					showDeleteItemDialog = false;
					deleteItemCmd.reset();
				}}>Nevermind</Button
			>
			<Button
				size="sm"
				variant="destructive"
				onclick={deleteItemCmd.submit}
				disabled={deleteItemCmd.submitting}
			>
				{#if deleteItemCmd.submitting}
					<Spinner />
				{:else}
					<Icon icon="mdi:delete" />
				{/if}
				Delete Item
			</Button>
		{/snippet}
	</ResponsiveDialog>
{/snippet}

{#snippet addItemDialog()}
	<ResponsiveDialog title="Add Item" bind:open={showAddItemDialog}>
		<div class="grid gap-3">
			<SelectInput
				searchable
				label="Entity"
				type="single"
				records={entities}
				valueKey="id"
				labelKey="name"
				bind:value={addItemCmd.form.entityId}
			/>
			<FieldInput type="number" label="Quantity" min="1" bind:value={addItemCmd.form.quantity} />
			<SwitchInput label="Batched Item" bind:checked={addItemCmd.form.batch} />
			<SwitchInput label="Custom Item" bind:checked={addItemCmd.form.custom} />
			<SwitchInput label="UUU" bind:checked={addItemCmd.form.uuu} />

			<TextareaInput
				label="Reason"
				bind:value={addItemCmd.form.reason}
				required
				description="Reason you are adding this item. Will be placed into the history."
			/>

			{#if addItemCmd.form.custom}
				<FieldInput
					label="Custom Image URL"
					placeholder="https://example.com/image.png"
					bind:value={addItemCmd.form.customImageUrl}
				/>
			{/if}
		</div>

		{#snippet footer()}
			<Button
				onclick={() => {
					showAddItemDialog = false;
					addItemCmd.reset();
				}}
			>
				Cancel
			</Button>
			<Button onclick={addItemCmd.submit} disabled={addItemCmd.submitting}>
				{#if addItemCmd.submitting}
					<Spinner />
				{:else}
					<Icon icon="mdi:plus" />
				{/if}
				Add to Lot
			</Button>
		{/snippet}
	</ResponsiveDialog>
{/snippet}

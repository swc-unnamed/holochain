<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { editLot } from '$lib/remote/auction-house/lot/edit-lot.remote.js';
	import { editLotSchema } from '$lib/remote/auction-house/lot/edit-lot.schema.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { CloudDownload, CloudUpload, GitPullRequestCreateArrow, Plus, X } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import CheckboxInput from '$lib/components/custom/fields/checkbox-input/checkbox-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { LotType } from '$lib/generated/prisma/enums.js';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import { createLotItemSchema } from '$lib/remote/auction-house/lot-item/create-lot-item.schema.js';
	import { createLotItem } from '$lib/remote/auction-house/lot-item/create-lot-item.remote.js';
	import LotItemAction from '$lib/components/custom/modules/auction-house/lot-item-action.svelte';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import { publishLotSchema } from '$lib/remote/auction-house/lot/publish-lot.schema.js';
	import { publishLot } from '$lib/remote/auction-house/lot/publish-lot.remote.js';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { withdrawLotSchema } from '$lib/remote/auction-house/lot/withdraw-lot.schema.js';
	import { withdrawLot } from '$lib/remote/auction-house/lot/withdraw-lot.remote.js';

	let { data } = $props();
	const lot = $derived(data.lot);
	const entities = $derived(data.entities);
	const lotDisabled = $derived.by(() => lot.status !== 'DRAFT');
	const canWithdraw = $derived.by(() => {
		switch (lot.status) {
			case 'LISTED':
				return true;
			case 'SCHEDULED':
				return true;
			case 'SOLD':
				return false;
			case 'DRAFT':
				return false;
			case 'COMPLETED':
				return false;
			case 'WITHDRAWN':
				return false;
			default:
				return false;
		}
	});
	let dialogOpen = $state(false);
	let publishDialogOpen = $state(false);
	let withdrawDialogOpen = $state(false);
	const mobile = new IsMobile();

	const lotCmd = new CommandForm(editLotSchema, {
		command: editLot,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			id: lot.id,
			title: lot.title,
			details: lot.details,
			location: lot.location,
			startPrice: lot.startPrice,
			status: lot.status,
			anonLot: lot.anonLot,
			type: lot.type
		}),
		onSuccess: () => {
			toast.success('Updated', {
				description: `Lot #${lot.lotNumber} has been updated successfully.`
			});
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error updating the lot #${lot.lotNumber}`
			});
		}
	});

	const newItemCmd = new CommandForm(createLotItemSchema, {
		command: createLotItem,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			lotId: lot.id,
			entityId: '',
			quantity: 1,
			batch: false,
			custom: false,
			uuu: true,
			notes: ''
		}),
		onSuccess: () => {
			toast.success('Item Added', {
				description: `A new item has been added to lot #${lot.lotNumber}.`
			});
			dialogOpen = false;
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error adding the item to lot #${lot.lotNumber}.`
			});
		}
	});

	const publishLotCmd = new CommandForm(publishLotSchema, {
		command: publishLot,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			lotId: lot.id
		}),
		onSuccess: () => {
			toast.success('Lot Published', {
				description: `Lot #${lot.lotNumber} has been published successfully.`
			});
			publishDialogOpen = false;
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error publishing lot #${lot.lotNumber}.`
			});
		}
	});

	const withdrawLotCmd = new CommandForm(withdrawLotSchema, {
		command: withdrawLot,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			lotId: lot.id
		}),
		onSuccess: () => {
			toast.success('Lot Withdrawn', {
				description: `Lot #${lot.lotNumber} has been withdrawn successfully.`
			});
			withdrawDialogOpen = false;
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error withdrawing lot #${lot.lotNumber}.`
			});
		}
	});
</script>

<PageWrapper title={`Edit Lot - ${lot.lotNumber}`} crumbOverrides={[[lot.id, `#${lot.lotNumber}`]]}>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		<div>
			<CardWrapper title="Lot Details">
				{#snippet description()}
					<p>Last Updated: {standardDateFormat(lot.updatedAt)}</p>
				{/snippet}
				{#snippet header()}
					<Badge>{lot.status}</Badge>
				{/snippet}
				<div class="grid gap-2">
					<FieldInput
						label="Title"
						bind:value={lotCmd.form.title}
						issues={lotCmd.errors.title?.message}
						readonly={lotDisabled}
					/>

					<FieldInput
						label="Starting Price"
						type="number"
						inputmode="numeric"
						pattern="[0-9]*"
						bind:value={lotCmd.form.startPrice}
						issues={lotCmd.errors.startPrice?.message}
						readonly={lotDisabled}
					/>

					{#if !lotDisabled}
						<SelectInput
							type="single"
							label="Type"
							bind:value={lotCmd.form.type}
							records={[
								{ value: LotType.LOT, label: 'Lot' },
								{ value: LotType.TEMPLATE, label: 'Template' }
							]}
							issues={lotCmd.errors.type?.message}
							valueKey="value"
							labelKey="label"
						/>
					{/if}

					{#if lotDisabled}
						{#if lot.anonLot}
							<p class="rounded-xl bg-orange-500/60 p-2 text-center font-bold">Anonymous Lot</p>
						{/if}
					{:else}
						<CheckboxInput
							label="Anonymous Lot"
							bind:checked={lotCmd.form.anonLot}
							description="If checked, only your ANONID will be visible."
							readonly={lotDisabled}
						/>
					{/if}

					<TextareaInput
						label="Details"
						bind:value={lotCmd.form.details}
						issues={lotCmd.errors.details?.message}
						readonly={lotDisabled}
					/>

					<TextareaInput
						label="Location"
						bind:value={lotCmd.form.location}
						issues={lotCmd.errors.location?.message}
						readonly={lotDisabled}
					/>
				</div>

				{#snippet footer()}
					<div class="flex w-full items-center justify-between gap-3">
						{#if lotCmd.form.type === LotType.LOT}
							{#if !lotDisabled}
								<ResponsiveDialog title="Publish Lot" bind:open={publishDialogOpen}>
									{#snippet trigger()}
										<Button variant="secondary" size="sm">
											<CloudUpload /> Publish Lot
										</Button>
									{/snippet}

									<div class="grid gap-3">
										<p>
											You are about to publish this lot. Once published, it will be visible to all
											users.
										</p>
										{#if lot.anonLot}
											<p>
												You are publishing this lot as an anonymous lot. Your
												<span class="text-orange-500">ANONID</span>
												will be the only identifier visible to users. Make sure you use a middle to ensure
												high anonymity.
											</p>
										{/if}
									</div>
									{#snippet footer()}
										<Button
											size="sm"
											variant="secondary"
											onclick={() => (publishDialogOpen = false)}
										>
											<X /> Nevermind, not yet
										</Button>
										<Button
											variant="secondary"
											size="sm"
											disabled={publishLotCmd.submitting}
											onclick={publishLotCmd.submit}
										>
											{#if publishLotCmd.submitting}
												<Spinner />
											{:else}
												<CloudUpload />
											{/if}
											Publish Lot
										</Button>
									{/snippet}
								</ResponsiveDialog>
							{/if}
						{/if}
						{#if !lotDisabled}
							<Button
								variant="secondary"
								size="sm"
								onclick={lotCmd.submit}
								disabled={lotCmd.submitting}
							>
								{#if lotCmd.submitting}
									<Spinner />
								{:else}
									<Plus />
								{/if}
								Save Changes
							</Button>
						{/if}
						{#if lotDisabled && canWithdraw}
							{@render withdrawDialog()}
						{/if}
					</div>
				{/snippet}
			</CardWrapper>
		</div>

		<div>
			<CardWrapper title="Lot Items">
				{#snippet header()}
					{#if !lotDisabled}
						{@render addItem()}
					{/if}
				{/snippet}
				<div class="grid gap-2">
					{#if lot.items.length < 1}
						<Empty />
					{/if}
					{#each lot.items as item}
						<LotItemAction {item} {entities} hideActions={lotDisabled} />
					{/each}
				</div>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

{#snippet addItem()}
	{#if mobile.current}
		<Drawer.Root bind:open={dialogOpen}>
			<Drawer.Trigger
				class={buttonVariants({
					size: 'sm',
					variant: 'ghost'
				})}
			>
				<GitPullRequestCreateArrow /> Add Item
			</Drawer.Trigger>
			<Drawer.Content class="min-h-1/2">
				<Drawer.Header>
					<Drawer.Title>Add Item</Drawer.Title>
					<Drawer.Description>Add a new item to this lot.</Drawer.Description>
				</Drawer.Header>

				{@render addItemContent()}

				<Drawer.Footer>
					<Drawer.Close class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
						<X /> Cancel
					</Drawer.Close>
					<Button disabled={newItemCmd.submitting} onclick={newItemCmd.submit}>
						{#if newItemCmd.submitting}
							<Spinner />
						{:else}
							<GitPullRequestCreateArrow />
						{/if}
						Add Item
					</Button>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	{:else}
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger
				class={buttonVariants({
					size: 'sm',
					variant: 'ghost'
				})}
			>
				<GitPullRequestCreateArrow /> Add Item
			</Dialog.Trigger>
			<Dialog.Content interactOutsideBehavior="ignore" class="min-h-1/2">
				<Dialog.Header>
					<Dialog.Title>Add Item</Dialog.Title>
					<Dialog.Description>Add a new item to this lot.</Dialog.Description>
				</Dialog.Header>

				{@render addItemContent()}

				<Dialog.Footer>
					<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
						<X /> Cancel
					</Dialog.Close>
					<Button disabled={newItemCmd.submitting} onclick={newItemCmd.submit}>
						{#if newItemCmd.submitting}
							<Spinner />
						{:else}
							<GitPullRequestCreateArrow />
						{/if}
						Add Item
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{/snippet}

{#snippet addItemContent()}
	<div class="grid gap-3">
		<SelectInput
			type="single"
			searchable
			label="Entity"
			records={entities}
			valueKey="id"
			labelKey="name"
			bind:value={newItemCmd.form.entityId}
			issues={newItemCmd.errors.entityId?.message}
		/>

		<FieldInput
			label="Quantity"
			type="number"
			bind:value={newItemCmd.form.quantity}
			issues={newItemCmd.errors.quantity?.message}
		/>

		<CheckboxInput
			label="U/U/U"
			description="Undocked / Unshielded / Undamaged"
			bind:checked={newItemCmd.form.uuu}
			issues={newItemCmd.errors.uuu?.message}
		/>

		<CheckboxInput
			label="Batch Item"
			description="This item is part of a batch."
			bind:checked={newItemCmd.form.batch}
			issues={newItemCmd.errors.batch?.message}
		/>

		<CheckboxInput
			label="Custom Item"
			description="This is considered a custom item."
			bind:checked={newItemCmd.form.custom}
			issues={newItemCmd.errors.custom?.message}
		/>

		<TextareaInput
			label="Notes"
			description="Any thing you want to say really."
			bind:value={newItemCmd.form.notes}
			issues={newItemCmd.errors.notes?.message}
		/>
	</div>
{/snippet}

{#snippet withdrawDialog()}
	<ResponsiveDialog title="Withdraw Lot" bind:open={withdrawDialogOpen}>
		{#snippet trigger()}
			<Button size="sm" variant="ghost">
				<CloudDownload />
				Withdraw Lot
			</Button>
		{/snippet}
		<p>
			Withdrawing this lot will remove it from public view. You can only withdraw lots that are
			currently listed or scheduled. Are you sure you want to proceed?
		</p>
		{#snippet footer()}
			<Button size="sm" variant="secondary" onclick={() => (withdrawDialogOpen = false)}>
				<X /> Nevermind
			</Button>
			<Button
				size="sm"
				variant="destructive"
				onclick={withdrawLotCmd.submit}
				disabled={withdrawLotCmd.submitting}
			>
				{#if withdrawLotCmd.submitting}
					<Spinner />
				{:else}
					<CloudDownload />
				{/if}
				Withdraw Lot
			</Button>
		{/snippet}
	</ResponsiveDialog>
{/snippet}

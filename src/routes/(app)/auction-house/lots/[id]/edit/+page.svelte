<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { editLot } from '$lib/remote/auction-house/lot/edit-lot.remote.js';
	import { editLotSchema } from '$lib/remote/auction-house/lot/edit-lot.schema.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import {
		CloudDownload,
		CloudUpload,
		GitPullRequestCreateArrow,
		Plus,
		X,
		Save,
		Loader2,
		Package,
		TrendingUp,
		Calendar,
		Eye
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import CheckboxInput from '$lib/components/custom/fields/checkbox-input/checkbox-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { LotType } from '$lib/generated/prisma/enums.js';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { toast } from 'svelte-sonner';
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
	import { getLotForEdit } from '$lib/remote/auction-house/lot/get-lot-for-edit.remote';
	import { getEntities } from '$lib/remote/holochain/database/get-entities.remote';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import { toLocalCurrency } from '$lib/utils/helpers/shared/currency';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';

	let { data } = $props();

	// Load lot and entities data
	let lot = $state(await getLotForEdit({ lotId: data.lotId }));
	let entities = $state(await getEntities());

	const lotDisabled = $derived.by(() => lot.status !== 'DRAFT');
	const canWithdraw = $derived.by(() => {
		switch (lot.status) {
			case 'LISTED':
				return true;
			case 'SCHEDULED':
				return false; // Cannot withdraw if scheduled for auction
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

	// Computed stats
	const stats = $derived.by(() => {
		const totalItems = lot.items.reduce((sum, item) => sum + item.quantity, 0);
		const uniqueItems = lot.items.length;
		return { totalItems, uniqueItems };
	});

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
		onSuccess: async () => {
			toast.success('Updated', {
				description: `Lot #${lot.lotNumber} has been updated successfully.`
			});
			// Reload lot data
			lot = await getLotForEdit({ lotId: data.lotId });
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
		onSuccess: async () => {
			toast.success('Item Added', {
				description: `A new item has been added to lot #${lot.lotNumber}.`
			});
			dialogOpen = false;
			// Reload lot data
			lot = await getLotForEdit({ lotId: data.lotId });
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
		onSuccess: async () => {
			toast.success('Lot Published', {
				description: `Lot #${lot.lotNumber} has been published successfully.`
			});
			publishDialogOpen = false;
			// Reload lot data
			lot = await getLotForEdit({ lotId: data.lotId });
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
		onSuccess: async () => {
			toast.success('Lot Withdrawn', {
				description: `Lot #${lot.lotNumber} has been withdrawn successfully.`
			});
			withdrawDialogOpen = false;
			// Reload lot data
			lot = await getLotForEdit({ lotId: data.lotId });
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error withdrawing lot #${lot.lotNumber}.`
			});
		}
	});

	function getStatusColor(status: string) {
		switch (status) {
			case 'DRAFT':
				return 'secondary';
			case 'LISTED':
				return 'default';
			case 'SCHEDULED':
				return 'default';
			case 'SOLD':
				return 'default';
			case 'WITHDRAWN':
				return 'outline';
			case 'COMPLETED':
				return 'default';
			default:
				return 'secondary';
		}
	}

	function getStatusLabel(status: string) {
		return status.charAt(0) + status.slice(1).toLowerCase();
	}
</script>

<PageWrapper title={`Edit Lot #${lot.lotNumber}`} crumbOverrides={[[lot.id, `#${lot.lotNumber}`]]}>
	<WipBanner />

	<!-- Action Bar -->
	<CardWrapper>
		<div class="flex flex-wrap items-center gap-3">
			{#if !lotDisabled}
				<Button
					variant="default"
					onclick={lotCmd.submit}
					disabled={lotCmd.submitting}
					class="gap-2"
				>
					{#if lotCmd.submitting}
						<Spinner />
					{:else}
						<Save class="size-4" />
					{/if}
					Save Changes
				</Button>
			{/if}

			{#if lotCmd.form.type === LotType.LOT && !lotDisabled}
				<Button variant="secondary" onclick={() => (publishDialogOpen = true)} class="gap-2">
					<CloudUpload class="size-4" />
					Publish Lot
				</Button>
			{/if}

			{#if canWithdraw}
				<Button variant="destructive" onclick={() => (withdrawDialogOpen = true)} class="gap-2">
					<CloudDownload class="size-4" />
					Withdraw Lot
				</Button>
			{/if}

			<div class="ml-auto">
				<Button
					variant="outline"
					onclick={() => goto(`/auction-house/lots/${lot.id}`)}
					class="gap-2"
				>
					<Eye class="size-4" />
					View Lot
				</Button>
			</div>
		</div>
	</CardWrapper>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Lot Details -->
		<div>
			<CardWrapper title="Lot Details">
				<div class="grid gap-4">
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
							<div class="rounded-lg bg-orange-500/20 p-3 text-center">
								<p class="font-semibold text-orange-700 dark:text-orange-300">Anonymous Lot</p>
							</div>
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
			</CardWrapper>
		</div>

		<!-- Lot Items -->
		<div>
			<CardWrapper title="Lot Items">
				{#snippet header()}
					{#if !lotDisabled}
						<Button onclick={() => (dialogOpen = true)} size="sm" class="gap-2">
							<Plus class="size-4" />
							Add Item
						</Button>
					{/if}
				{/snippet}

				{#if lot.items.length === 0}
					<Empty />
				{:else}
					<div class="hidden md:block">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-20">Image</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Type</Table.Head>
									<Table.Head class="text-right">Quantity</Table.Head>
									<Table.Head>Attributes</Table.Head>
									{#if !lotDisabled}
										<Table.Head class="text-right">Actions</Table.Head>
									{/if}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each lot.items as item (item.id)}
									<Table.Row>
										<Table.Cell>
											{#if item.entity.imageSmall}
												<img
													src={item.entity.imageSmall}
													alt={item.entity.name}
													class="size-12 rounded object-cover"
												/>
											{:else}
												<div class="flex size-12 items-center justify-center rounded bg-muted">
													<Package class="size-6 text-muted-foreground" />
												</div>
											{/if}
										</Table.Cell>
										<Table.Cell class="font-medium">{item.name}</Table.Cell>
										<Table.Cell>
											<Badge variant="outline">{item.entity.type}</Badge>
										</Table.Cell>
										<Table.Cell class="text-right">
											{#if item.batch}
												{item.quantity}
												{item.quantity === 1 ? 'batch' : 'batches'}
											{:else}
												{item.quantity}
											{/if}
										</Table.Cell>
										<Table.Cell>
											<div class="flex gap-1">
												{#if item.uuu}
													<Badge variant="secondary" class="text-xs">U/U/U</Badge>
												{/if}
												{#if item.custom}
													<Badge variant="secondary" class="text-xs">Custom</Badge>
												{/if}
												{#if !item.uuu && !item.custom}
													<span class="text-xs text-muted-foreground">-</span>
												{/if}
											</div>
										</Table.Cell>
										{#if !lotDisabled}
											<Table.Cell class="text-right">
												<LotItemAction {item} {entities} hideActions={lotDisabled} />
											</Table.Cell>
										{/if}
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

<!-- Add Item Dialog -->
<ResponsiveDialog title="Add Item" bind:open={dialogOpen}>
	<p class="mb-4 text-sm text-muted-foreground">Add a new item to this lot.</p>
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
	</div>
	{#snippet footer()}
		<Button size="sm" variant="ghost" onclick={() => (dialogOpen = false)}>
			<X class="size-4" />
			Cancel
		</Button>
		<Button disabled={newItemCmd.submitting} onclick={newItemCmd.submit} class="gap-2">
			{#if newItemCmd.submitting}
				<Spinner />
			{:else}
				<GitPullRequestCreateArrow class="size-4" />
			{/if}
			Add Item
		</Button>
	{/snippet}
</ResponsiveDialog>

<!-- Publish Dialog -->
<ResponsiveDialog title="Publish Lot" bind:open={publishDialogOpen}>
	<div class="grid gap-3">
		<p>You are about to publish this lot. Once published, it will be visible to all users.</p>
		{#if lot.anonLot}
			<p class="rounded-lg bg-orange-500/20 p-3 text-sm">
				You are publishing this lot as an anonymous lot. Your
				<span class="font-semibold text-orange-700 dark:text-orange-300">ANONID</span>
				will be the only identifier visible to users. Make sure you use a middle to ensure high anonymity.
			</p>
		{/if}
	</div>
	{#snippet footer()}
		<Button size="sm" variant="secondary" onclick={() => (publishDialogOpen = false)}>
			<X class="size-4" />
			Cancel
		</Button>
		<Button
			variant="default"
			size="sm"
			disabled={publishLotCmd.submitting}
			onclick={publishLotCmd.submit}
			class="gap-2"
		>
			{#if publishLotCmd.submitting}
				<Spinner />
			{:else}
				<CloudUpload class="size-4" />
			{/if}
			Publish Lot
		</Button>
	{/snippet}
</ResponsiveDialog>

<!-- Withdraw Dialog -->
<ResponsiveDialog title="Withdraw Lot" bind:open={withdrawDialogOpen}>
	<p>
		Withdrawing this lot will remove it from public view. You can only withdraw lots that are
		currently listed. Are you sure you want to proceed?
	</p>
	{#snippet footer()}
		<Button size="sm" variant="secondary" onclick={() => (withdrawDialogOpen = false)}>
			<X class="size-4" />
			Cancel
		</Button>
		<Button
			size="sm"
			variant="destructive"
			onclick={withdrawLotCmd.submit}
			disabled={withdrawLotCmd.submitting}
			class="gap-2"
		>
			{#if withdrawLotCmd.submitting}
				<Spinner />
			{:else}
				<CloudDownload class="size-4" />
			{/if}
			Withdraw Lot
		</Button>
	{/snippet}
</ResponsiveDialog>

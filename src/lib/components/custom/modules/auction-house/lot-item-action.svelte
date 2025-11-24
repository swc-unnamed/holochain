<script lang="ts">
	import Item from '$lib/components/custom/item/item.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import type { LotItem } from '$lib/generated/prisma/client';
	import { Check, Delete, GitPullRequestCreateArrow, Pencil, X } from '@lucide/svelte';
	import CheckboxInput from '../../fields/checkbox-input/checkbox-input.svelte';
	import FieldInput from '../../fields/field-input/field-input.svelte';
	import SelectInput from '../../fields/select-input/select-input.svelte';
	import TextareaInput from '../../fields/textarea-input/textarea-input.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { editLotItemSchema } from '$lib/remote/auction-house/lot-item/edit-lot-item.schema';
	import { editLotItem } from '$lib/remote/auction-house/lot-item/edit-lot-item.remote';
	import { toast } from 'svelte-sonner';
	import ResponsiveDialog from '../../responsive-dialog/responsive-dialog.svelte';
	import { deleteLotItemSchema } from '$lib/remote/auction-house/lot-item/delete-lot-item.schema';
	import { deleteLotItem } from '$lib/remote/auction-house/lot-item/delete-lot-item.remote';

	type Props = {
		item: LotItem;
		hideActions?: boolean;
		entities: {
			id: string;
			name: string;
			type: string;
			imageSmall: string;
		}[];
	};

	let { item, entities, hideActions = $bindable(false) }: Props = $props();
	let dialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let entity = $derived.by(() => {
		return entities.find((e) => e.id === item.entityId);
	});
	const mobile = new IsMobile();

	const cmd = new CommandForm(editLotItemSchema, {
		command: editLotItem,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			id: item.id,
			entityId: item.entityId,
			quantity: item.quantity,
			uuu: item.uuu,
			batch: item.batch,
			custom: item.custom
		}),
		onSuccess: () => {
			toast.success('Updated', {
				description: `Item ${item.name} has been updated successfully.`
			});
			dialogOpen = false;
		},
		onError: () => {
			toast.error('Error', {
				description: `There was an error updating the item ${item.name}.`
			});
		}
	});

	const cmdDelete = new CommandForm(deleteLotItemSchema, {
		command: deleteLotItem,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			lotId: item.lotId,
			itemId: item.id
		}),
		onSuccess: () => {
			toast.success('Deleted', {
				description: `Item ${item.name} has been deleted successfully.`
			});
			deleteDialogOpen = false;
		},
		onError: (err) => {
			console.error('Delete Item Error:', err);
			toast.error('Error', {
				description: `There was an error deleting the item ${item.name}.`
			});
		}
	});
</script>

<Item variant="outline">
	{#snippet title()}
		<div class="flex items-center gap-1">
			<img class="size-6 border" src={entity?.imageSmall} alt="" />
			<a href={`/holochain/database/${item.entityId}`} class="underline underline-offset-4">
				{item.name}
			</a>
			<span class="text-xs text-muted-foreground">x{item.quantity}</span>
		</div>
	{/snippet}
	{#snippet description()}
		<div class="flex flex-wrap items-center gap-1">
			{#if item.uuu}
				<Check class="size-4" /> <span class="text-sm">U/U/U</span>
			{/if}
			{#if item.batch}
				<Check class="size-4" /> <span class="text-sm">Batch Item</span>
			{/if}
			{#if item.custom}
				<Check class="size-4" /> <span class="text-sm">Custom Item</span>
			{/if}
		</div>
	{/snippet}

	{#snippet actionSnippet()}
		{#if !hideActions}
			<ButtonGroup.Root>
				{@render editDialog()}
				{@render deleteItem()}
			</ButtonGroup.Root>
		{/if}
	{/snippet}
</Item>

{#snippet editDialog()}
	{#if mobile.current}
		<Drawer.Root bind:open={dialogOpen}>
			<Drawer.Trigger
				class={buttonVariants({
					size: 'sm',
					variant: 'secondary'
				})}
			>
				<Pencil /> Edit
			</Drawer.Trigger>
			<Drawer.Content class="min-h-1/2">
				<Drawer.Header>
					<Drawer.Title>Edit Item</Drawer.Title>
				</Drawer.Header>

				{@render editContent()}

				<Drawer.Footer>
					<Drawer.Close class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
						<X /> Cancel
					</Drawer.Close>
					<Button onclick={cmd.submit}>Save Changes</Button>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	{:else}
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger
				class={buttonVariants({
					size: 'sm',
					variant: 'secondary'
				})}
			>
				<Pencil /> Edit
			</Dialog.Trigger>
			<Dialog.Content interactOutsideBehavior="ignore" class="min-h-1/2">
				<Dialog.Header>
					<Dialog.Title>Edit Item</Dialog.Title>
				</Dialog.Header>

				{@render editContent()}

				<Dialog.Footer>
					<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
						<X /> Cancel
					</Dialog.Close>
					<Button onclick={cmd.submit}>Save Changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{/snippet}

{#snippet editContent()}
	<div class="grid gap-3">
		<SelectInput
			type="single"
			searchable
			label="Entity"
			records={entities}
			valueKey="id"
			labelKey="name"
			bind:value={cmd.form.entityId}
			issues={cmd.errors.entityId?.message}
		/>

		<FieldInput
			label="Quantity"
			type="number"
			inputmode="numeric"
			pattern="[0-9]*"
			bind:value={cmd.form.quantity}
			issues={cmd.errors.quantity?.message}
		/>

		<CheckboxInput
			label="U/U/U"
			description="Undocked / Unshielded / Undamaged"
			bind:checked={cmd.form.uuu}
			issues={cmd.errors.uuu?.message}
		/>

		<CheckboxInput
			label="Batch Item"
			description="This item is part of a batch."
			bind:checked={cmd.form.batch}
			issues={cmd.errors.batch?.message}
		/>

		<CheckboxInput
			label="Custom Item"
			description="This is considered a custom item."
			bind:checked={cmd.form.custom}
			issues={cmd.errors.custom?.message}
		/>

		<TextareaInput
			label="Notes"
			description="Any thing you want to say really."
			bind:value={cmd.form.notes}
			issues={cmd.errors.notes?.message}
		/>
	</div>
{/snippet}

{#snippet deleteItem()}
	<Button variant="secondary" size="sm" onclick={() => (deleteDialogOpen = true)}>
		<Delete /> Delete
	</Button>
	<ResponsiveDialog
		title="Are you sure?"
		description="Read the following...very carefully"
		bind:open={deleteDialogOpen}
	>
		<p>
			Are you sure you want to remove this item? You <span class="text-destructive">can not</span> undo
			this.
		</p>

		{#snippet footer()}
			<Button size="sm" variant="secondary" onclick={() => (deleteDialogOpen = false)}>
				Nevermind, I'll keep it
			</Button>
			<Button size="sm" variant="destructive" onclick={cmdDelete.submit}>Delete</Button>
		{/snippet}
	</ResponsiveDialog>
{/snippet}

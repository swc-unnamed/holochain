<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { editEntitySchema } from '$lib/remote/holochain/database/edit-entity.schema.js';
	import { editEntity } from '$lib/remote/holochain/database/edit.entity.remote.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { Save } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let { data } = $props();
	let entity = $derived(data.entity);

	const cmd = new CommandForm(editEntitySchema, {
		command: editEntity,
		initial: () => ({
			id: entity.id,
			name: entity.name,
			type: entity.type,
			combineUid: entity.combineUid,
			combineHref: entity.combineHref,
			imageSmall: entity.imageSmall,
			imageLarge: entity.imageLarge
		}),
		onSuccess: () => {
			toast.success('Success', {
				description: `${entity.name} has been updated.`
			});
		}
	});

	async function sync() {
		toast.warning('Not Implemented', {
			description: 'This feature has not been implemented yet.'
		});
	}
</script>

<PageWrapper title="Edit Database Entry" crumbOverrides={[[entity.id, entity.name]]}>
	<Alert.Root class="mb-4 border-destructive">
		<Alert.Title>Warning</Alert.Title>
		<Alert.Description>
			Editing database entries can lead to data inconsistency. Ensure that you understand the
			implications before making changes.
		</Alert.Description>
	</Alert.Root>
	<CardWrapper title="Edit Database Entry">
		{#snippet header()}
			<Button variant="outline" size="sm" onclick={sync}>Combine API Sync</Button>
		{/snippet}
		<div class="grid gap-4">
			<FieldInput label="Name" bind:value={cmd.form.name} />
			<FieldInput label="Type" bind:value={cmd.form.type} />
			<FieldInput label="Combine UID" bind:value={cmd.form.combineUid} />
			<FieldInput type="url" label="Combine API URL" bind:value={cmd.form.combineHref} />
			<FieldInput type="url" label="Small Image URL" bind:value={cmd.form.imageSmall} />
			<FieldInput type="url" label="Large Image URL" bind:value={cmd.form.imageLarge} />
		</div>

		{#snippet footer()}
			<div class="flex w-full justify-end">
				<Button onclick={cmd.submit}>
					{#if cmd.submitting}
						<Spinner />
					{:else}
						<Save />
					{/if}
					Save
				</Button>
			</div>
		{/snippet}
	</CardWrapper>
</PageWrapper>

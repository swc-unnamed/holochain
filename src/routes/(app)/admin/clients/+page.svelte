<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { createClientSchema } from '$lib/remote/admin/clients/create-client.schema';
	import { createClient } from '$lib/remote/admin/clients/create-client.remote';
	import { toast } from 'svelte-sonner';
	import { listClients } from '$lib/remote/admin/clients/list-clients.remote';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import { goto } from '$app/navigation';

	let clients = $derived(await listClients());

	const createClientCmd = new CommandForm(createClientSchema, {
		command: createClient,
		onSuccess: () => {
			toast.success('API Client created successfully');
		},
		onError: () => {
			toast.error('Failed to create API Client');
		}
	});
</script>

<PageWrapper title="API Clients">
	<CardWrapper title="API Clients" description="Manage API Clients">
		<div class="grid gap-3">
			<FieldInput label="Client Name" bind:value={createClientCmd.form.name} />
			<FieldInput label="Description" bind:value={createClientCmd.form.description} />
			<Button onclick={createClientCmd.submit}>Create</Button>
		</div>
	</CardWrapper>

	<CardWrapper>
		<Table.Table>
			<Table.Header>
				<Table.Row>
					<Table.Head>Client ID</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Description</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each clients as client}
					<Table.Row
						class="hover:cursor-pointer"
						onclick={async () => {
							await goto(`/admin/clients/${client.id}`);
						}}
					>
						<Table.Cell>{client.id}</Table.Cell>
						<Table.Cell>{client.name}</Table.Cell>
						<Table.Cell>{client.description}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Table>
		<pre>{JSON.stringify(clients, null, 2)}</pre>
	</CardWrapper>
</PageWrapper>

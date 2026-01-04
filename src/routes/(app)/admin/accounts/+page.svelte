<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	let { data } = $props();
	let accounts = $state(data.users);

	let search = $state('');

	$effect(() => {
		if (search.toLowerCase().trim() === '') {
			accounts = data.users;
		} else {
			accounts = data.users.filter(
				(account) =>
					account.displayName.toLowerCase().includes(search.toLowerCase().trim()) ||
					account.name.toLowerCase().includes(search.toLowerCase().trim())
			);
		}
	});
</script>

<PageWrapper title="Accounts">
	<CardWrapper title="User Accounts">
		{#snippet header()}
			<div class="flex items-center justify-end">
				<FieldInput placeholder="Search accounts..." bind:value={search} />
			</div>
		{/snippet}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Display Name</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>CTR</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>Discord Linked</Table.Head>
					<Table.Head>Banned</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each accounts as account (account.id)}
					<Table.Row
						onclick={async () => {
							goto(`/admin/accounts/${account.id}`);
						}}
						class="cursor-pointer hover:bg-accent/50"
					>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<Avatar.Root>
									<Avatar.Image src={account.avatarUrl} alt={account.displayName} />
									<Avatar.Fallback>{account.displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
								</Avatar.Root>
								<span>{account.displayName}</span>
							</div>
						</Table.Cell>
						<Table.Cell>{account.name}</Table.Cell>
						<Table.Cell>{account.ctr}</Table.Cell>
						<Table.Cell>{account.role}</Table.Cell>
						<Table.Cell>{account.discordId ? 'Yes' : 'No'}</Table.Cell>
						<Table.Cell>{account.banned ? 'Yes' : 'No'}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</CardWrapper>
</PageWrapper>

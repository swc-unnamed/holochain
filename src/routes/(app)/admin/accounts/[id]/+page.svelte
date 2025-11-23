<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import UserAvatar from '$lib/components/custom/user-avatar/user-avatar.svelte';
	import UserKarma from '$lib/components/custom/user-karma/user-karma.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { FieldLabel } from '$lib/components/ui/field/index.js';
	import { STYLES } from '$lib/components/custom/fields/styles.js';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import { banUser } from '$lib/remote/admin/accounts/ban-user.remote.js';
	import { toast } from 'svelte-sonner';
	import Item from '$lib/components/custom/item/item.svelte';
	import { Ban } from '@lucide/svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import { invalidate } from '$app/navigation';

	const { data } = $props();
	const user = $derived(data.userDetails);
	let banUserDialogOpen = $state(false);
	let banData = $state<{ reason: string; bannedUntil: string }>({
		reason: '',
		bannedUntil: ''
	});

	async function handleBanUser() {
		const res = await banUser({
			userId: user.id,
			reason: banData.reason,
			bannedUntil: banData.bannedUntil
		});
		if (res.success) {
			toast.success('User has been banned successfully.');
			await invalidate('admin:accounts:id');
		} else {
			toast.error('Failed to ban user. Please try again.');
		}
	}
</script>

<PageWrapper title={user.displayName} crumbOverrides={[[user.id, user.displayName]]}>
	<CardWrapper>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<UserAvatar id={user.id} />
				<div class="flex flex-col gap-0">
					<span>{user.displayName}</span>
					<div class="flex items-center gap-2 text-sm">
						<span>{user.role}</span>
						<UserKarma karma={user.karma} />
					</div>
				</div>
			</div>

			<Dialog.Root bind:open={banUserDialogOpen}>
				<Dialog.Trigger
					class={buttonVariants({
						variant: 'destructive',
						size: 'sm'
					})}
				>
					Ban User
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Ban User?</Dialog.Title>
					</Dialog.Header>

					<div class="grid gap-3">
						<TextareaInput label="Ban Reason" bind:value={banData.reason} />
						<FieldInput label="Banned Until" bind:value={banData.bannedUntil} type="date" />
					</div>

					<Dialog.Footer>
						<div class="flex justify-end gap-2">
							<Button variant="outline" size="sm" onclick={() => (banUserDialogOpen = false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onclick={async () => {
									await handleBanUser();
									banUserDialogOpen = false;
								}}
							>
								Confirm Ban
							</Button>
						</div>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</CardWrapper>

	{#if user.banned}
		<div class="">
			<Item title="Banned" variant="outline">
				{#snippet description()}
					<div class="flex flex-col gap-1">
						<p>
							Banned Until: {user.bannedUntil ? standardDateFormat(user.bannedUntil) : 'Forever'}
						</p>
						<p>Banned Reason:</p>
						<p class="whitespace-pre-wrap">{user.bannedReason}</p>
					</div>
				{/snippet}
				{#snippet media()}
					<Ban />
				{/snippet}
			</Item>
		</div>
	{/if}

	<CardWrapper title="Overview">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<FieldInput label="Name" value={user.displayName} readonly />
			<FieldInput label="Display Name" value={user.displayName} readonly />
			<FieldInput label="ANONID" value={user.anonid} readonly />
		</div>
	</CardWrapper>

	<CardWrapper title="Accounts">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#if user.combineId}
				<FieldInput label="Combine ID" value={user.combineId} readonly />

				<div class="grid-col-1 grid gap-0">
					<FieldLabel>
						<span class={STYLES.input.label}>Scopes</span>
					</FieldLabel>
					<div class="flex flex-wrap items-center gap-2">
						{#each user.combineScopes as scope}
							<Badge>{scope}</Badge>
						{/each}
					</div>
				</div>
			{:else}
				<Empty
					title="No Combine Account"
					description="This user has not connected their Combine account."
				/>
			{/if}

			{#if user.discordId}
				<FieldInput label="Discord ID" value={user.discordId} readonly />
				<FieldInput label="Discord Username" value={user.discordUsername} readonly />
			{:else}
				<Empty
					title="No Discord Account"
					description="This user has not connected their Discord account."
				/>
			{/if}
		</div>
	</CardWrapper>

	<CardWrapper title="User Activity">
		<Empty
			title="Under Construction"
			description="We are still working on this section, check back later."
		/>
	</CardWrapper>

	<CardWrapper>
		<h2 class="mb-4 text-lg font-medium">User Settings</h2>
		<div class="grid gap-4">
			{#each user.preferences as pref}
				<Item title={pref.key} description={pref.value} variant="outline" />
			{/each}
		</div>
	</CardWrapper>
</PageWrapper>

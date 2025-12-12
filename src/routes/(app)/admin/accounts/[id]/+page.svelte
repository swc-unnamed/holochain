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
	import { Ban, Save } from '@lucide/svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import { invalidate } from '$app/navigation';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { updateUserSchema } from '$lib/remote/admin/accounts/update-user.schema';
	import { updateUser } from '$lib/remote/admin/accounts/update-user.remote.js';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { AppRole } from '$lib/generated/prisma/enums.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';

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

	const updateUserCmd = new CommandForm(updateUserSchema, {
		command: updateUser,
		invalidate: 'admin:accounts:id',
		initial: () => ({
			userId: user.id,
			displayName: user.displayName,
			name: user.name,
			role: user.role
		}),
		onSuccess: () => {
			toast.success('User updated successfully.');
		},
		onError: () => {
			toast.error('Failed to update user');
		}
	});
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

			{#if user.name !== 'um_admin'}
				<ResponsiveDialog
					bind:open={banUserDialogOpen}
					title="Ban User?"
					trigger="Ban User"
					triggerButton={buttonVariants({
						variant: 'destructive',
						size: 'sm'
					})}
				>
					<div class="grid gap-3">
						<TextareaInput label="Ban Reason" bind:value={banData.reason} />
						<FieldInput label="Banned Until" bind:value={banData.bannedUntil} type="date" />
					</div>

					{#snippet footer()}
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
					{/snippet}
				</ResponsiveDialog>
			{/if}
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
		<div class="grid w-full gap-3">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<FieldInput
					label="Name"
					description="Be careful when changing this, this is the user's login username."
					bind:value={updateUserCmd.form.name}
				/>
				<FieldInput label="Display Name" value={updateUserCmd.form.displayName} />
				<SelectInput
					type="single"
					label="Role"
					bind:value={updateUserCmd.form.role}
					records={[
						{ label: 'Patron', value: AppRole.PATRON },
						{ label: 'Auctioneer', value: AppRole.AUCTIONEER },
						{ label: 'Developer', value: AppRole.DEVELOPER },
						{ label: 'Tzar', value: AppRole.TZAR }
					]}
					labelKey="label"
					valueKey="value"
				/>
				<FieldInput label="ANONID" value={user.anonid} readonly />
			</div>
			<div class="w-full">
				<Button
					class="w-full md:w-auto"
					onclick={updateUserCmd.submit}
					disabled={updateUserCmd.submitting}
				>
					{#if updateUserCmd.submitting}
						<Spinner />
					{:else}
						<Save />
					{/if}
					Save Changes
				</Button>
			</div>
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

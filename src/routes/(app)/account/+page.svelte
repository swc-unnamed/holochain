<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AvatarWrapper from '$lib/components/custom/avatar-wrapper/avatar-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import UserAvatar from '$lib/components/custom/user-avatar/user-avatar.svelte';
	import UserKarma from '$lib/components/custom/user-karma/user-karma.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { resetAnonId } from '$lib/remote/account/reset-anonid.remote.js';
	import {
		updateAccount,
		updateAccountPreference
	} from '$lib/remote/account/update-account.remote.js';
	import { updateAccountSchema } from '$lib/remote/account/update-account.schema.js';
	import { commandForm } from '$lib/utils/remote/command-form.svelte';
	import { toast } from 'svelte-sonner';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ItemSwitch } from '$lib/components/custom/item-switch/index.js';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { UserPreferences } from '$lib/types/user-preference-detail.js';
	import type { UserPreferenceKey } from '$lib/generated/prisma/enums.js';
	import DataTable from '$lib/components/custom/data-table/data-table.svelte';
	import { karmaLogColumns } from './karma-logs.columns.js';
	import { cn } from '$lib/utils.js';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import { setMode } from 'mode-watcher';
	import { CommandForm } from '@akcodeworks/svelte-command-form';

	const mobile = new IsMobile();
	let { data } = $props();
	let account = $derived(data.account);
	let selectedTab = $state('details');
	let blurAnonId = $state(true);
	let { form, submit } = $derived(
		new CommandForm(updateAccountSchema, {
			initial: () => ({
				displayName: account.displayName,
				avatarUrl: account.avatarUrl
			}),
			command: updateAccount,
			invalidate: 'app:account',
			onSuccess: () => {
				toast.success('Account updated successfully.');
			}
		})
	);

	async function resetAnonymousId() {
		// Logic to reset the anonymous ID
		const res = await resetAnonId();
		if (res.success) {
			toast.success('Anonymous ID has been reset.');
			await invalidate('app:account');
			await invalidate('app:global');
		} else {
			toast.error('Failed to reset Anonymous ID.');
		}
	}

	async function updatePreference({ key, value }: { key: UserPreferenceKey; value: string }) {
		const res = await updateAccountPreference({ key, value });
		if (res.success) {
			toast.success(res.message);
			await invalidate('app:account');
		} else {
			toast.error(res.message);
		}
	}
</script>

<PageWrapper title="Account">
	<CardWrapper>
		<div class="flex items-center gap-3">
			<UserAvatar id={account.id} />
			<div class="flex flex-col gap-0">
				<span>{account.displayName}</span>
				<div class="flex items-center gap-2 text-sm">
					<span>
						{account.role}
					</span>
					<UserKarma karma={account.karma} />
				</div>
			</div>
		</div>
	</CardWrapper>

	<Tabs.Root bind:value={selectedTab}>
		<Tabs.List class={mobile.current ? 'w-full' : ''}>
			<Tabs.Trigger value="details">Account Details</Tabs.Trigger>
			<Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
			<Tabs.Trigger value="karma_logs">Karma Logs</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="details">
			<CardWrapper title="Account Details">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FieldInput label="Name" value={account.name} readonly />
					<FieldInput label="Display Name" bind:value={form.displayName} />
					<FieldInput
						label="ANONID"
						class={cn(blurAnonId && 'blur-sm', 'w-full transition-all')}
						bind:value={account.anonid}
						readonly
					>
						{#snippet descriptionSnippet()}
							<div class="grid gap-1">
								<span>
									This is used as your Display Name when you have Anonymous mode enabled. It is
									randomly generated and cannot be manually changed, but you can reset it to get a
									new one.
								</span>
								<div class="flex items-center gap-2">
									<Button size="sm" variant="ghost" onclick={resetAnonymousId}>Reset</Button>
									<SwitchInput label="Blur ANONID" bind:checked={blurAnonId} class="w-48" />
								</div>
							</div>
						{/snippet}
					</FieldInput>
					<FieldInput label="Avatar URL" bind:value={form.avatarUrl} />
				</div>

				<Separator class="my-3" />
				<div class="flex justify-end">
					<Button onclick={submit}>Save Changes</Button>
				</div>
			</CardWrapper>
		</Tabs.Content>

		<Tabs.Content value="preferences">
			<CardWrapper title="Preferences">
				<div class="grid gap-4">
					{#each account.preferences as pref}
						{@const prefDetails = UserPreferences[pref.key]}
						{#if pref.key === 'GLOBAL_THEME_MODE'}
							<SelectInput
								label={prefDetails.name}
								description={prefDetails.description}
								type="single"
								value={pref.value}
								records={[
									{ label: 'Light', value: 'light' },
									{ label: 'Dark', value: 'dark' },
									{ label: 'System', value: 'system' }
								]}
								labelKey="label"
								valueKey="value"
								onValueChange={async (val) => {
									await updatePreference({
										key: pref.key,
										value: val || 'system'
									});

									setMode((val || 'system') as 'light' | 'dark' | 'system');
								}}
							/>
						{:else}
							<ItemSwitch
								label={prefDetails.name}
								description={prefDetails.description}
								checked={pref.value === 'true'}
								onCheckedChange={async (val) => {
									await updatePreference({
										key: pref.key,
										value: val ? 'true' : 'false'
									});
								}}
							/>
						{/if}
					{/each}
				</div>
			</CardWrapper>
		</Tabs.Content>

		<Tabs.Content value="karma_logs">
			<CardWrapper title="Karma Logs">
				<DataTable data={account.karmaLogs} columns={karmaLogColumns} />
			</CardWrapper>
		</Tabs.Content>
	</Tabs.Root>
</PageWrapper>

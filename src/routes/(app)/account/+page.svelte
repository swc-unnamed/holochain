<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AvatarWrapper from '$lib/components/custom/avatar-wrapper/avatar-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { resetAnonId } from '$lib/remote/account/reset-anonid.remote.js';
	import {
		updateAccount,
		updateAccountPreference
	} from '$lib/remote/account/update-account.remote.js';
	import { updateAccountSchema } from '$lib/remote/account/update-account.schema.js';
	import { toast } from 'svelte-sonner';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import * as Tabs from '$lib/components/custom/underline-tabs/index.js';
	import { ItemSwitch } from '$lib/components/custom/item-switch/index.js';
	import { UserPreferences } from '$lib/types/user-preference-detail.js';
	import type { UserPreferenceKey } from '$lib/generated/prisma/enums.js';
	import { cn } from '$lib/utils.js';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import { setMode } from 'mode-watcher';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import Item from '$lib/components/custom/item/item.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Icon from '@iconify/svelte';
	import { unlinkDiscordAccount } from '$lib/remote/auth/unlink-discord.remote.js';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte.js';
	import { getCtrLogs } from '$lib/remote/account/get-ctr-logs.remote.js';
	import type { ChainTrustRatingLog } from '$lib/generated/prisma/client.js';
	import * as Table from '$lib/components/ui/table';
	import Pagination from '$lib/components/custom/pagination/pagination.svelte';
	import { UserInfoCard } from '$lib/components/custom/user-info/index.js';
	import { CTREvent } from '$lib/types/ctr-event-detail';

	const ctrQuery = new QueryState<ChainTrustRatingLog>({
		pagination: {
			take: 50,
			skip: 0,
			mode: 'offset'
		}
	});

	let { data } = $props();
	let account = $derived(data.account);
	let ctrLogs = $derived(await getCtrLogs(ctrQuery.current));
	let selectedTab = $state('details');
	let blurAnonId = $state(true);

	let { form, submit } = new CommandForm(updateAccountSchema, {
		initial: () => ({
			displayName: account.displayName,
			avatarUrl: account.avatarUrl
		}),
		command: updateAccount,
		invalidate: 'app:account',
		onSuccess: () => {
			toast.success('Account updated successfully.');
		}
	});

	$effect(() => {
		if (ctrLogs.totalCount) {
			ctrQuery.setCount(ctrLogs.totalCount);
		}
	});

	const mobile = new IsMobile();

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
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<AvatarWrapper image={account.avatarUrl} />
				<div class="flex flex-col gap-0">
					<span>{account.displayName}</span>
					<div class="flex items-center gap-2 text-sm">
						<span>
							{account.role}
						</span>
						<span class="text-xs">•</span>
						<span class="text-sm">CTR: {account.ctr}</span>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Button size="sm" variant="ghost" onclick={resetAnonymousId}>Reset</Button>
				<SwitchInput label="Blur ANONID" bind:checked={blurAnonId} class="w-48" />
			</div>
		</div>
	</CardWrapper>

	<Tabs.Root bind:value={selectedTab}>
		<Tabs.List class="w-full">
			<Tabs.Trigger value="details">Account Details</Tabs.Trigger>
			<Tabs.Trigger value="ctr_logs">Chain Trust Rating</Tabs.Trigger>
			<Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="details">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div class="grid gap-3">
					<CardWrapper title="Account Details">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FieldInput label="Name" value={account.name} readonly />
							<FieldInput label="Display Name" bind:value={form.displayName} />
							<FieldInput
								label="ANONID"
								class={cn(blurAnonId && 'blur-xs', 'w-full transition-all')}
								bind:value={account.anonid}
								readonly
							/>
							<FieldInput label="Avatar URL" bind:value={form.avatarUrl} />
						</div>

						{#snippet footer()}
							<div class="flex w-full justify-end">
								<Button onclick={submit}>Save Changes</Button>
							</div>
						{/snippet}
					</CardWrapper>
				</div>

				<div>
					<CardWrapper title="Biometric Data">
						<div class="grid gap-3">
							<Item title="Combine Biometrics" variant="outline">
								{#snippet footer()}
									<div class="grid gap-2">
										<div class="grid grid-cols-2 gap-2">
											<p>Combine ID</p>
											<p>{account.combineId}</p>
										</div>
										<div class="grid grid-cols-2 gap-2">
											<p>Combine Scopes</p>
											<div class="flex flex-wrap items-center">
												{#each account.combineScopes as scope}
													<Badge variant="outline">{scope}</Badge>
												{/each}
											</div>
										</div>
									</div>
								{/snippet}
							</Item>

							<Item title="Discord Biometrics" variant="outline">
								{#snippet footer()}
									{#if !data.discordOAuthUrl}
										<Empty
											title="Discord Biometrics Not Configured"
											description="There's nothing for you to do, the Holochain has not been configured for Discord Biometrics linking yet."
										/>
									{:else if !account.discordId}
										<Empty
											title="Not Linked"
											description="You have not linked your Discord account."
										>
											{#snippet iconSnippet()}
												<Icon icon="line-md:discord" />
											{/snippet}

											{#snippet content()}
												<Button size="sm" variant="outline" href={data.discordOAuthUrl}>
													Link Now
												</Button>
											{/snippet}
										</Empty>
									{:else}
										<div class="grid gap-2">
											<div class="grid grid-cols-2 gap-2">
												<span>Discord ID</span>
												<span>{account.discordId}</span>
											</div>
											<div class="grid grid-cols-2 gap-2">
												<span>Discord Username</span>
												<span>{account.discordUsername}</span>
											</div>
										</div>
									{/if}
								{/snippet}

								{#snippet actionSnippet()}
									{#if account.discordId}
										<Button
											size="sm"
											variant="outline"
											onclick={async () => {
												const res = await unlinkDiscordAccount();
												if (res.success) {
													toast.success('Discord account unlinked successfully.');
													await invalidate('app:account');
												} else {
													toast.error('Failed to unlink Discord account.', {
														description: 'Contact Holochain support for assistance.'
													});
												}
											}}
										>
											<Icon icon="mingcute:unlink-2-line" />
											Unlink Discord Account
										</Button>
									{/if}
								{/snippet}
							</Item>
						</div>
					</CardWrapper>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="ctr_logs">
			<CardWrapper title="Chain Trust Rating Changes">
				{#if mobile.current}
					<div class="grid gap-3">
						{#each ctrLogs.logs as log}
							<Item
								variant="outline"
								title={`${log.delta > 0 ? '+' : ''}${log.delta} Karma`}
								description={log.reason}
								footer={`${standardDateFormat(log.createdAt)}`}
							/>
						{/each}
					</div>
				{:else}
					<Table.Root>
						<Table.Caption>
							<Pagination query={ctrQuery} perPage={50} />
						</Table.Caption>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-48">Event</Table.Head>
								<Table.Head class="w-48">Change Delta</Table.Head>
								<Table.Head class="w-2/3">Reason</Table.Head>
								<Table.Head>Date</Table.Head>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{#each ctrLogs.logs as log}
								{@const ctrEvent = data.ctrConfig.find((c) => c.key === log.event)}
								<Table.Row>
									<Table.Cell>
										<span class="flex items-center gap-1">
											<Icon icon={ctrEvent?.icon || ''} />
											<span>{CTREvent[log.event].label}</span>
										</span>
									</Table.Cell>
									<Table.Cell class="flex items-center gap-2">
										{#if log.delta > 0}
											<Icon icon="bx:upvote" class="text-primary" />
										{:else}
											<Icon icon="bx:downvote" class="text-destructive" />
										{/if}
										<span>
											{log.delta > 0 ? '+' : ''}{log.delta} Chain Trust
										</span>
									</Table.Cell>
									<Table.Cell class="wrap-break-word">{log.reason}</Table.Cell>
									<Table.Cell>{standardDateFormat(log.createdAt)}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</CardWrapper>
		</Tabs.Content>

		<Tabs.Content value="preferences">
			<CardWrapper title="Preferences">
				<div class="grid gap-4">
					{#each account.preferences as pref}
						{@const prefDetails = UserPreferences[pref.key]}
						{#if prefDetails.key === 'GLOBAL_ENABLE_NOTIFICATIONS'}
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
	</Tabs.Root>
</PageWrapper>

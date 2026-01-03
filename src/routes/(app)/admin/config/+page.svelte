<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { updateAdminConfig } from '$lib/remote/admin/config/update-config.remote.js';
	import { updateAdminConfigSchema } from '$lib/remote/admin/config/update-config.schema.js';
	import { toast } from 'svelte-sonner';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { SaveIcon } from '@lucide/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Tabs from '$lib/components/custom/underline-tabs';
	import { ChainTrustRatingKey } from '$lib/generated/prisma/enums';
	import { CTREvent } from '$lib/types/ctr-event-detail';
	import { updateCtrConfig } from '$lib/remote/admin/config/update-ctr-config.remote.js';
	import { updateCtrConfigSchema } from '$lib/remote/admin/config/update-ctr-config.schema.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let showSecrets = $state(false);

	const cmd = new CommandForm(updateAdminConfigSchema, {
		command: updateAdminConfig,
		initial: () => ({
			combineClientId: data.combineClientId,
			combineClientSecret: data.combineClientSecret,
			discordClientId: data.discordClientId,
			discordClientSecret: data.discordClientSecret
		}),
		onSuccess: () => {
			toast.success('Configuration saved successfully');
		},
		onError: (err) => {
			toast.error(`Failed to save configuration`, {
				description: (err as Error).message
			});
		}
	});

	const ctrCmd = new CommandForm(updateCtrConfigSchema, {
		command: updateCtrConfig,
		initial: () => ({
			data: data.ctrConfig
		}),
		onSuccess: () => {
			toast.success('Chain Trust Rating configuration saved successfully');
		},
		onError: () => {
			toast.error('Failed to save Chain Trust Rating configuration');
		}
	});
</script>

<PageWrapper title="Configuration">
	<Tabs.Root value="ctr">
		<Tabs.List>
			<Tabs.Trigger value="ctr">Chain Trust Rating Config</Tabs.Trigger>
			<Tabs.Trigger value="biometrics">Biometrics Config</Tabs.Trigger>
			<Tabs.Trigger value="integrations">Integrations</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="ctr">
			<CardWrapper title="Chain Trust Rating Configuration">
				{#snippet header()}
					<Button onclick={ctrCmd.submit} disabled={ctrCmd.submitting} variant="outline" size="sm">
						{#if ctrCmd.submitting}
							<Spinner />
						{:else}
							<SaveIcon class="size-4" />
						{/if}
						Save Changes
					</Button>
				{/snippet}
				<ul class="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>
						Adjust the points and reasons for various Chain Trust Rating events below. These
						settings determine how user actions impact their overall trust score within the
						Holochain ecosystem.
					</li>
					<li>
						Positive points increase a user's trust score, while negative points decrease it. The
						reason provided will be displayed to users in their Chain Trust Rating history.
					</li>
					<li>Make sure to save your changes after adjusting the settings.</li>
					<li>
						To disable a specific event from affecting the Chain Trust Rating, set its points to
						zero.
					</li>
					<li>
						The Holochain is built on transparency. If you change a value - ensure you communicate
						it to the masses. These settings will be publicly visible on the Holocron.
					</li>
					<li>
						For the Icons, please refer to <a
							href="https://icon-sets.iconify.design/"
							target="_blank"
							rel="norel">Iconfiy</a
						>. For example, to use the "star" icon from the "mdi" set, you would enter "mdi:star".
					</li>
				</ul>

				<div class="grid gap-3">
					{#each ctrCmd.form.data as ctr, index (ctr.key)}
						<div class="grid gap-2 rounded-md border p-4">
							<div class="flex items-center gap-1">
								<Icon icon={ctrCmd.form.data![index].icon} class="size-6" />
								<h5>{ctr.key}</h5>
							</div>
							<span class="text-sm text-muted-foreground">
								{CTREvent[ctr.key].description}
							</span>
							<div class="grid grid-cols-1 gap-2 md:grid-cols-3">
								<FieldInput
									label="Points"
									type="number"
									description="Positive or negative points to adjust the user's trust score"
									bind:value={ctrCmd.form.data![index].points}
								/>
								<FieldInput
									label="Reason"
									bind:value={ctrCmd.form.data![index].reason}
									description="A brief explanation of why these points were assigned, shown to users in their Chain Trust Rating history. Some data we will automatically insert, such as Lot numbers etc."
								/>
								<FieldInput
									label="Icon"
									bind:value={ctrCmd.form.data![index].icon}
									description="Icon to represent this event in the UI (use Iconify format, e.g., 'mdi:star')"
								/>
							</div>
						</div>
					{/each}
				</div>
			</CardWrapper>
		</Tabs.Content>

		<Tabs.Content value="biometrics">
			<div class="grid gap-3">
				<CardWrapper title="Biometrics OAuth Settings">
					{#snippet header()}
						<div class="flex items-center gap-2">
							<SwitchInput label="Show Secrets" bind:checked={showSecrets} />
							<Button variant="outline" size="sm" onclick={cmd.submit} disabled={cmd.submitting}>
								{#if cmd.submitting}
									<Spinner />
								{:else}
									<SaveIcon class="size-4" />
								{/if}
								<span>Save Changes</span>
							</Button>
						</div>
					{/snippet}
				</CardWrapper>
				<CardWrapper title="Combine Settings">
					<div class="grid gap-4">
						<FieldInput
							label="Combine Client ID"
							bind:value={cmd.form.combineClientId}
							class={cn(!showSecrets && 'blur-xs')}
						/>
						<FieldInput
							label="Combine Client Secret"
							bind:value={cmd.form.combineClientSecret}
							class={cn(!showSecrets && 'blur-xs')}
						/>
					</div>
				</CardWrapper>

				<CardWrapper
					title="Discord Settings"
					description="Settings for Discord OAuth integration. This will allow users to sync their Holochain account with their Discord account, enabling features such as role assignment and notifications."
				>
					<div class="grid gap-4">
						<FieldInput
							label="Discord Client ID"
							bind:value={cmd.form.discordClientId}
							class={cn(!showSecrets && 'blur-xs')}
						/>
						<FieldInput
							label="Discord Client Secret"
							bind:value={cmd.form.discordClientSecret}
							class={cn(!showSecrets && 'blur-xs')}
						/>
					</div>
				</CardWrapper>
			</div>
		</Tabs.Content>

		<Tabs.Content value="integrations">
			<CardWrapper title="Inngest">
				<p>
					Manually re-sync Inngest events with the Holochain application. This is typically done
					automatically after deployments, but can be triggered here if needed.
				</p>
				<Button
					onclick={async () => {
						const res = await fetch('/api/inngest', { method: 'PUT' });
						if (res.ok) {
							toast.success('Inngest re-sync triggered successfully');
						} else {
							toast.error('Failed to trigger Inngest re-sync');
						}
					}}
				>
					Re-sync Inngest
				</Button>
			</CardWrapper>
		</Tabs.Content>
	</Tabs.Root>
</PageWrapper>

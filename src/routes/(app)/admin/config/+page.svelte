<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import { ItemSwitch } from '$lib/components/custom/item-switch/index.js';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { SiteConfig } from '$lib/types/site-config-detail';
	import * as Alert from '$lib/components/ui/alert';
	import { commandForm } from '$lib/utils/remote/command-form.svelte.js';
	import { updateAdminConfig } from '$lib/remote/admin/config/update-config.remote.js';
	import { updateAdminConfigSchema } from '$lib/remote/admin/config/update-config.schema.js';
	import type { SiteConfigurationKey } from '$lib/generated/prisma/enums';
	import { toast } from 'svelte-sonner';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { SaveIcon } from '@lucide/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';

	let { data } = $props();
	let showSecrets = $state(false);

	const cmd = new CommandForm(updateAdminConfigSchema, {
		command: updateAdminConfig,
		initial: () => ({
			combineClientId: data.combineClientId,
			combineClientSecret: data.combineClientSecret,
			globalDisableNameVerification: data.globalDisableNameVerification,
			globalRequireCombineAuth: data.globalRequireCombineAuth
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
</script>

<PageWrapper title="Configuration">
	<Alert.Root class="border-destructive">
		<Alert.Title class="text-xl">Oy, read this!</Alert.Title>
		<Alert.Description>
			<p>
				These settings are global and will affect <span class="text-destructive">all</span> users on
				the platform. Be very when changing these settings.
			</p>
		</Alert.Description>
	</Alert.Root>

	<CardWrapper title="Global Settings">
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
		<div class="grid gap-4">
			<ItemSwitch
				label="Require Combine Authentication"
				description="Require users to authenticate via the Combine for added security, enhancing trust and accountability on the platform. Only the accounts starting with um_ will be allowed to login without Combine authentication."
				bind:checked={cmd.form.globalRequireCombineAuth}
			/>
			<ItemSwitch
				label="Disable Name Verification"
				description="Disable the name verification process during user registration and login, allowing users to choose any name without validation against the Combine database."
				bind:checked={cmd.form.globalDisableNameVerification}
			/>
		</div>
	</CardWrapper>

	<CardWrapper title="Combine Settings">
		<div class="grid gap-4">
			<FieldInput
				label="Combine Client ID"
				bind:value={cmd.form.combineClientId}
				class={cn(!showSecrets && 'blur-sm')}
			/>
			<FieldInput
				label="Combine Client Secret"
				bind:value={cmd.form.combineClientSecret}
				class={cn(!showSecrets && 'blur-sm')}
			/>
		</div>
	</CardWrapper>
</PageWrapper>

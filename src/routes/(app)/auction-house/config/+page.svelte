<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getAuctionConfig } from '$lib/remote/auction-house/config/get-config.remote';
	import { updateAuctionConfig } from '$lib/remote/auction-house/config/update-config.remote';
	import { updateAuctionConfigSchema } from '$lib/remote/auction-house/config/update-config.schema';
	import { AuctionConfig } from '$lib/types/auction-config-detail';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import type { HttpError } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';

	let config = $state(await getAuctionConfig());

	const f = new CommandForm(updateAuctionConfigSchema, {
		command: updateAuctionConfig,
		initial: () => ({
			liveDiscordBroadcastWebhookUrl:
				config.find((c) => c.key === AuctionConfig['LIVE_DISCORD_BROADCAST_WEBHOOK_URL'].key)
					?.value ?? null
		}),
		onSuccess: () => {
			toast.success('Configuration updated successfully');
		},
		onError: (err) => {
			const errMsg = (err as HttpError).body.message || 'Failed to update configuration';
			toast.error(errMsg);
		}
	});
</script>

<PageWrapper title="Auction House Config">
	<CardWrapper title="Auction House Config">
		<FieldInput
			label={AuctionConfig['LIVE_DISCORD_BROADCAST_WEBHOOK_URL'].name}
			description={AuctionConfig['LIVE_DISCORD_BROADCAST_WEBHOOK_URL'].description}
			bind:value={f.form.liveDiscordBroadcastWebhookUrl}
		/>

		{#snippet footer()}
			<div class="flex w-full justify-end">
				<Button onclick={f.submit} disabled={f.submitting}>Save</Button>
			</div>
		{/snippet}
	</CardWrapper>
</PageWrapper>

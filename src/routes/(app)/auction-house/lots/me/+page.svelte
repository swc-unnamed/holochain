<script lang="ts">
	import { goto } from '$app/navigation';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { createDraftLot } from '$lib/remote/auction-house/lot/create-draft-lot.remote.js';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let lots = $derived(data.lots);

	async function generateDraft() {
		const res = await createDraftLot();
		if (res.success) {
			toast.success(res.message);
			await goto(`/auction-house/lots/${res.id}/edit`);
		} else {
			toast.error(res.message);
		}
	}
</script>

<PageWrapper title="My Lots">
	<CardWrapper title="My Lots">
		{#snippet header()}
			<Button onclick={generateDraft}>Create Lot</Button>
		{/snippet}
		<Item
			title="I get it - it's ugly right now"
			description="But I'm working on it! In the meantime, click the button to create a new draft lot."
			variant="outline"
		/>

		<div class="mt-3 grid gap-3">
			{#each lots as lot}
				<Item
					title={`Lot #${lot.lotNumber}: ${lot.title}`}
					variant="outline"
					action={{
						text: 'Edit',
						onClick: async () => await goto(`/auction-house/lots/${lot.id}/edit`)
					}}
				/>
			{/each}
		</div>
	</CardWrapper>
</PageWrapper>

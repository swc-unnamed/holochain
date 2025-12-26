<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Pagination from '$lib/components/custom/pagination/pagination.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Entity } from '$lib/generated/prisma/client.js';
	import { getEntities } from '$lib/remote/holochain/database/get-entities.remote.js';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte.js';

	const query = new QueryState<Entity>({
		order: [{ field: 'name', direction: 'asc' }]
	});

	let search = $state('');
	const entities = $derived(await getEntities(query.current));
	const filteredEntities = $derived(entities.records);
</script>

<PageWrapper title="Database">
	<CardWrapper title="Holochain Database">
		<div class="grid gap-4">
			<div class="grid">
				<FieldInput label="Entity Search" bind:value={search} />
			</div>

			<div class="grid gap-3">
				{#each filteredEntities as entity}
					<Item variant="outline">
						{#snippet title()}
							<div class="flex items-center gap-3">
								<img class="size-16 border" src={entity.imageSmall} alt={entity.name} />
								<span class="text-xl">{entity.name}</span>
							</div>
						{/snippet}
						{#snippet footer()}
							<div class="flex flex-wrap items-center gap-4">
								<span class="text-xs text-muted-foreground">
									Transactions: {entity._count.transactions}
								</span>
								<span class="text-xs text-muted-foreground">ID: {entity.id}</span>
							</div>
						{/snippet}
						{#snippet actionSnippet()}
							<Button href="/holochain/database/{entity.id}">View Details</Button>
						{/snippet}
					</Item>
				{/each}
			</div>
		</div>
	</CardWrapper>
</PageWrapper>

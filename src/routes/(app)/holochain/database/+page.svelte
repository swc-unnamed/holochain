<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Pagination from '$lib/components/custom/pagination/pagination.svelte';
	import type { Entity } from '$lib/generated/prisma/client.js';
	import {
		getEntities,
		getEntityTypes
	} from '$lib/remote/holochain/database/get-entities.remote.js';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { goto, preloadData } from '$app/navigation';
	import { Debounced } from 'runed';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	const query = new QueryState<Entity>({
		order: [{ field: 'name', direction: 'asc' }],
		pagination: {
			take: 20,
			skip: 0,
			mode: 'offset'
		}
	});

	let search = $state('');
	const entities = $derived(await getEntities(query.current));
	const entityTypes = $derived(await getEntityTypes());
	const debouncedSearch = new Debounced(() => search, 500);

	$effect(() => {
		if (entities.totalCount) {
			query.setCount(entities.totalCount);
		}

		if (debouncedSearch.current) {
			query.where.add('name', {
				contains: debouncedSearch.current,
				mode: 'insensitive'
			});
		} else {
			query.where.remove('name');
		}
	});
</script>

<PageWrapper title="Database">
	<CardWrapper title="Holochain Database">
		<div class="grid gap-3">
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<FieldInput label="Entity Search" bind:value={search} />
				<SelectInput
					label="Type Filter"
					type="single"
					records={entityTypes.types}
					labelKey="type"
					valueKey="type"
					allowDeselect
					onValueChange={(v) => {
						query.where.remove('type');
						if (v) {
							query.where.add('type', v);
						}
					}}
				/>
			</div>

			<div class="grid gap-3">
				<Table.Root>
					<Table.Caption>
						<Pagination {query} perPage={20} />
					</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-48"></Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head class="w-32">Type</Table.Head>
							<Table.Head class="w-32">Transactions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each entities.records as entity (entity.id)}
							{@const type = entity.type}
							<Table.Row
								class="hover:cursor-pointer"
								onmouseenter={async () => {
									await preloadData(`/holochain/database/${entity.id}`);
								}}
								onclick={async () => {
									await goto(`/holochain/database/${entity.id}`);
								}}
							>
								<Table.Cell>
									<img
										src={type === 'materials' ? entity.imageLarge : entity.imageSmall}
										alt={entity.name}
										class="size-12"
									/>
								</Table.Cell>
								<Table.Cell>
									{entity.name}
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{entity.type}</Badge>
								</Table.Cell>
								<Table.Cell>
									{entity._count.transactions}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	</CardWrapper>
</PageWrapper>

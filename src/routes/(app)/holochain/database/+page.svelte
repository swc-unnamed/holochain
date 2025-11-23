<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import DataTable from '$lib/components/custom/data-table/data-table.svelte';
	import HyperlinkCell from '$lib/components/custom/data-table/hyperlink-cell.svelte';
	import ImageCell from '$lib/components/custom/data-table/image-cell.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { renderComponent } from '$lib/components/ui/data-table/render-helpers.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import type { ColumnDef } from '@tanstack/table-core';

	let { data } = $props();
	let entities = $derived(data.entities);
	const mobile = new IsMobile();

	const columns: ColumnDef<(typeof entities)[0]>[] = [
		{
			accessorKey: 'imageSmall',
			header: '',
			size: 50,
			cell: ({ getValue }) => {
				const src = getValue<string>();
				return renderComponent(ImageCell, {
					src: src,
					alt: 'Entity Image'
				});
			}
		},
		{
			accessorKey: 'id',
			header: 'Name',
			cell: ({ getValue, row }) => {
				const name = row.original.name;
				return renderComponent(HyperlinkCell, {
					text: name,
					href: `/holochain/database/${getValue<string>()}`
				});
			}
		},
		{
			accessorKey: '_count',
			header: 'Transactions',
			cell: ({ getValue }) => {
				const count = getValue<{ transactions: number }>();
				return count.transactions;
			}
		}
	];
</script>

<PageWrapper title="Database">
	<CardWrapper title="Holochain Database">
		<div class="grid gap-4">
			<div class="grid">
				<FieldInput label="Entity Search" disabled description="Disabled for now" />
			</div>

			{#if mobile.current}
				<div class="grid gap-3">
					{#each entities as entity}
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
								<Button>View Details</Button>
							{/snippet}
						</Item>
					{/each}
				</div>
			{:else}
				<DataTable data={entities} {columns} />
			{/if}
		</div>
	</CardWrapper>
</PageWrapper>

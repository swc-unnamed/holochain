<script lang="ts">
	import DataTable from '$lib/components/custom/data-table/data-table.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import ImageCell from '$lib/components/custom/data-table/image-cell.svelte';

	import type { ColumnDef } from '@tanstack/table-core';
	import HyperlinkCell from '$lib/components/custom/data-table/hyperlink-cell.svelte';

	let { data } = $props();
	let transactions = $derived(data.transactions);

	const columns: ColumnDef<(typeof data.transactions)[0]>[] = [
		{
			accessorKey: 'timestamp',
			header: 'Timestamp',
			size: 50,
			cell: ({ getValue }) => {
				const date = new Date(getValue() as string);
				return standardDateFormat(date);
			}
		},
		{
			accessorKey: 'entity.name',
			header: 'Entity',
			size: 75,
			cell: ({ row }) => {
				return renderComponent(HyperlinkCell, {
					text: row.original.entity.name,
					href: `/holochain/database/${row.original.entity.id}`
				});
			}
		},
		{
			accessorKey: 'fromAnonid',
			header: 'From ANONID',
			size: 50
		},
		{
			accessorKey: 'toAnonid',
			header: 'To ANONID',
			size: 50
		},
		{
			accessorKey: 'type',
			header: 'Type'
		},
		{
			accessorKey: 'value',
			header: 'Value',
			cell: ({ getValue }) => {
				const val = getValue<number>();
				// FORMAT VAL WITH COMMAS
				return Intl.NumberFormat('en-US', {
					currency: 'USD',
					minimumFractionDigits: 0
				}).format(val);
			}
		}
	];
</script>

<PageWrapper title="Transactions">
	<WipBanner />
	<DataTable {columns} data={transactions} />
</PageWrapper>

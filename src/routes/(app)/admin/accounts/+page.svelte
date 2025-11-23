<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import DataTable from '$lib/components/custom/data-table/data-table.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { accountColumns } from './columns.js';

	let { data } = $props();
	const accounts = $derived(data.users);
</script>

<PageWrapper title="Accounts">
	<CardWrapper title="User Accounts">
		<DataTable data={accounts} columns={accountColumns} />
	</CardWrapper>
</PageWrapper>

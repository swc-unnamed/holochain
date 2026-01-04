<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { getClientDetail } from '$lib/remote/admin/clients/get-client-detail.remote.js';

	let { data } = $props();
	let details = $derived(await getClientDetail({ id: data.id }));
</script>

<PageWrapper title="API Client Details">
	<CardWrapper title="API Client Details" description="Manage API Client">
		<pre>{JSON.stringify(details, null, 2)}</pre>
	</CardWrapper>
</PageWrapper>

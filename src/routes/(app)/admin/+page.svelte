<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { FolderCodeIcon } from '@lucide/svelte';
</script>

<PageWrapper title="Admin Overview">
	<Empty
		title="Under Development"
		description="This page is still under development and is not ready just yet. Check back later to see more."
	/>
</PageWrapper>

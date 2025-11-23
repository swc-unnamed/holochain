<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';
	import { FolderCodeIcon } from '@lucide/svelte';
</script>

<PageWrapper title="Admin Overview">
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<CardWrapper title="Total Accounts">
			<p class="text-center text-2xl">69</p>
		</CardWrapper>

		<CardWrapper title="Banned Accounts">
			<p class="text-center text-2xl">5</p>
		</CardWrapper>

		<CardWrapper title="Completed Transactions">
			<p class="text-center text-2xl">420</p>
		</CardWrapper>
	</div>
</PageWrapper>

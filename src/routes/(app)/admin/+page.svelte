<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { FolderCodeIcon } from '@lucide/svelte';

	let { data } = $props();
</script>

<PageWrapper title="Admin Overview">
	<div class="grid gap-3">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<CardWrapper title="Linked Discord Accounts">
				<p class="text-center text-xl">
					{data.linkedDiscordAccountsCount}
				</p>
			</CardWrapper>

			<CardWrapper title="New Users This Month">
				<p class="text-center text-xl">
					{data.newUsersThisMonth}
				</p>
			</CardWrapper>

			<CardWrapper title="Banned Accounts">
				<p class="text-center text-xl">
					{data.bannedAccountsCount}
				</p>
			</CardWrapper>

			<CardWrapper title="Total Lots">
				<p class="text-center text-xl">
					{data.totalLotCount}
				</p>
			</CardWrapper>

			<CardWrapper title="Average Chain Trust per User">
				<p class="text-center text-xl">
					{data.averageChainTrustPerUser.toFixed(2)}
				</p>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

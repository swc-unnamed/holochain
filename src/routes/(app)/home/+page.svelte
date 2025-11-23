<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
</script>

<PageWrapper title="Home">
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<CardWrapper title="Open Listings">
			<p>Content for Open Listings goes here.</p>
		</CardWrapper>
		<CardWrapper title="Open Transactions">
			<p>Content for Open Listings goes here.</p>
		</CardWrapper>
		<CardWrapper title="Chain Karma">
			<p>Info graph</p>
		</CardWrapper>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		<CardWrapper title="Recent Activities">
			<p>Content for Recent Activities goes here.</p>
		</CardWrapper>
		<CardWrapper title="Notifications">
			<p>Content for Notifications goes here.</p>
		</CardWrapper>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<div>
			<CardWrapper title="Market Trends">
				<p>Content for Market Trends goes here.</p>
			</CardWrapper>
		</div>
		<div class="col-span-2">
			<CardWrapper title="Confirmed Transactions">
				<p>Recent Transactions</p>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

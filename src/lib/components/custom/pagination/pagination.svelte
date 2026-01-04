<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	let { query, perPage = $bindable() } = $props();
</script>

<Pagination.Root count={query.count ?? 0} perPage={perPage || 50}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton onclick={() => query.prev()} />
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link
							onclick={() => query.goto(page.value)}
							{page}
							isActive={currentPage === page.value}
						>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton onclick={() => query.next()} />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>

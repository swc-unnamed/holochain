<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import type { Auction, AuctionStatus } from '$lib/generated/prisma/client';
	import { getAuctionArchive } from '$lib/remote/auction-house/auctions/get-auction-archive.remote';
	import { QueryState } from '$lib/remote/query-state/query-state.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { goto, preloadData } from '$app/navigation';
	import SelectInput from '$lib/components/custom/fields/select-input/select-input.svelte';
	import { auctionStatusSelect } from '$lib/types/auction-house/auction-status';
	import { Button } from '$lib/components/ui/button';
	import Empty from '$lib/components/custom/empty/empty.svelte';

	const query = new QueryState<Auction>({
		pagination: {
			mode: 'offset',
			take: 50,
			skip: 0
		}
	});

	let auctions = $derived(await getAuctionArchive(query.current));

	$effect(() => {
		if (auctions.totalCount) {
			query.setCount(auctions.totalCount);
		}
	});
</script>

<PageWrapper title="Auction Archive">
	<CardWrapper title="Auction Archive">
		{#snippet header()}
			<div class="flex items-end justify-end gap-3">
				<div class="min-w-48">
					<SelectInput
						label="Status"
						type="single"
						allowDeselect
						records={auctionStatusSelect}
						labelKey="label"
						valueKey="value"
						value={query.where.value.status as AuctionStatus | null}
						onValueChange={(val) => {
							if (!val) return;
							query.where.remove('status');
							query.where.add('status', val);
						}}
					/>
				</div>

				<Button
					disabled={!query.where.value.status}
					onclick={() => {
						query.where.remove('status');
					}}>Clear</Button
				>
			</div>
		{/snippet}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Auction Title</Table.Head>
					<Table.Head>Start Date</Table.Head>
					<Table.Head>Status</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each auctions.auctions as auction}
					<Table.Row
						class="hover:cursor-pointer"
						onmouseenter={async () => {
							await preloadData(`/auction-house/auctions/${auction.id}`);
						}}
						onclick={async () => {
							await goto(`/auction-house/auctions/${auction.id}`);
						}}
					>
						<Table.Cell>{auction.title}</Table.Cell>
						<Table.Cell>
							{#if auction.start}
								{new Date(auction.start).toLocaleDateString()}
							{:else}
								-
							{/if}
						</Table.Cell>
						<Table.Cell>{auction.status}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if auctions.auctions.length === 0}
			<div class="mt-3">
				<Empty title="No archived auctions found." />
			</div>
		{/if}
	</CardWrapper>
</PageWrapper>

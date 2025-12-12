<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import WipBanner from '$lib/components/custom/wip-banner.svelte';
	import Badge, { type BadgeVariant } from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import type { Prisma, AuctionStatus } from '$lib/generated/prisma/browser';
	import { MousePointerBan, ArrowDown01, ReplaceAll, Radio } from '@lucide/svelte';

	type AuctionWithLots = Prisma.AuctionGetPayload<{
		include: { _count: { select: { lots: true } } };
	}>;

	type AuctionsPageData = {
		auctions: AuctionWithLots[];
	};

	let { data }: { data: AuctionsPageData } = $props();

	const auctions = $derived(data.auctions ?? []);
	const now = new Date();
	const nowTime = now.getTime();

	const toDate = (value?: Date | string | null) => (value ? new Date(value) : null);

	const formatDate = (value?: Date | string | null) => {
		const parsed = toDate(value);
		return parsed ? standardDateFormat(parsed) : null;
	};

	const compareStartAsc = (a: AuctionWithLots, b: AuctionWithLots) => {
		const aTime = toDate(a.start)?.getTime() ?? Number.MAX_SAFE_INTEGER;
		const bTime = toDate(b.start)?.getTime() ?? Number.MAX_SAFE_INTEGER;
		return aTime - bTime;
	};

	const compareEndDesc = (a: AuctionWithLots, b: AuctionWithLots) => {
		const aTime = toDate(a.end)?.getTime() ?? toDate(a.start)?.getTime() ?? 0;
		const bTime = toDate(b.end)?.getTime() ?? toDate(b.start)?.getTime() ?? 0;
		return bTime - aTime;
	};

	const isCurrentAuction = (auction: AuctionWithLots) => {
		const startTime = toDate(auction.start)?.getTime();
		const endTime = toDate(auction.end)?.getTime();

		if (auction.status === 'ACTIVE') {
			return !endTime || endTime >= nowTime;
		}

		if (startTime && endTime) {
			return startTime <= nowTime && nowTime <= endTime;
		}

		if (startTime && !endTime) {
			return startTime <= nowTime;
		}

		return false;
	};

	const isUpcomingAuction = (auction: AuctionWithLots) => {
		const startTime = toDate(auction.start)?.getTime();

		if (startTime) {
			return startTime > nowTime;
		}

		return auction.status === 'PENDING';
	};

	const currentAuctions = $derived(
		auctions.filter((auction) => isCurrentAuction(auction)).sort(compareStartAsc)
	);

	const upcomingAuctions = $derived(
		auctions
			.filter((auction) => !isCurrentAuction(auction) && isUpcomingAuction(auction))
			.sort(compareStartAsc)
	);

	const firstCurrentAuction = $derived(currentAuctions.length ? currentAuctions[0] : null);
	const firstUpcomingAuction = $derived(upcomingAuctions.length ? upcomingAuctions[0] : null);

	const recentCompletedAuctions = $derived(
		auctions
			.filter((auction) => {
				if (auction.status === 'COMPLETED') return true;
				const endTime = toDate(auction.end)?.getTime();
				return typeof endTime === 'number' && endTime < nowTime;
			})
			.sort(compareEndDesc)
			.slice(0, 4)
	);

	const stats = $derived({
		total: auctions.length,
		current: currentAuctions.length,
		upcoming: upcomingAuctions.length,
		liveLots: currentAuctions.reduce((sum, auction) => sum + auction._count.lots, 0)
	});

	const nextUpcomingStart = $derived(
		firstUpcomingAuction ? formatDate(firstUpcomingAuction.start) : null
	);

	const statusBadgeVariant = (status: AuctionStatus): BadgeVariant => {
		switch (status) {
			case 'ACTIVE':
				return 'default';
			case 'PENDING':
				return 'outline';
			case 'CANCELLED':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	const humanize = (value: string | null | undefined) =>
		value
			? value
					.toLowerCase()
					.split('_')
					.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
					.join(' ')
			: '';

	const lotsLabel = (count: number) => `${count} ${count === 1 ? 'Lot' : 'Lots'}`;
</script>

<PageWrapper title="Auction House">
	<div class="flex flex-col gap-6">
		<div class="grid gap-4 md:grid-cols-3">
			<CardWrapper title="Live auctions" description="Open and accepting bids">
				{#snippet header()}
					<Radio />
				{/snippet}
				<div class="flex items-baseline justify-between">
					<span class="text-4xl font-semibold">{stats.current}</span>
				</div>
				<p class="text-sm text-muted-foreground">
					{#if firstCurrentAuction}
						Next closing {formatDate(firstCurrentAuction.end) ?? 'TBD'}
					{:else}
						No auctions are currently live.
					{/if}
				</p>
			</CardWrapper>

			<CardWrapper title="Upcoming" description="Scheduled launches">
				{#snippet header()}
					<ArrowDown01 />
				{/snippet}
				<div class="text-4xl font-semibold">{stats.upcoming}</div>
				<p class="text-sm text-muted-foreground">
					{#if nextUpcomingStart}
						Next start {nextUpcomingStart}
					{:else}
						Waiting on new launch dates.
					{/if}
				</p>
			</CardWrapper>

			<CardWrapper title="Catalog coverage" description="Lots across live auctions">
				{#snippet header()}
					<ReplaceAll />
				{/snippet}
				<div class="text-4xl font-semibold">{stats.liveLots}</div>
				<p class="text-sm text-muted-foreground">
					Total lots available for bidding across all current auctions.
				</p>
			</CardWrapper>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<CardWrapper title="Current auctions" description="Open for bidding">
				{#if currentAuctions.length === 0}
					<Empty
						title="No live auctions"
						description="Check back soon or review the upcoming schedule below."
					/>
				{:else}
					<div class="grid gap-3">
						{#each currentAuctions as auction}
							<Item variant="outline">
								{#snippet header()}
									<div class="flex flex-wrap items-center gap-2 text-xs">
										<Badge variant="outline">{humanize(auction.type)}</Badge>
										<Badge variant={statusBadgeVariant(auction.status)}>
											{humanize(auction.status)}
										</Badge>
									</div>
								{/snippet}

								{#snippet title()}
									<div class="flex flex-col gap-1">
										<span class="text-base font-semibold">{auction.title}</span>
										<p class="text-sm text-muted-foreground">
											{auction.description || 'No description provided.'}
										</p>
									</div>
								{/snippet}

								{#snippet footer()}
									<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
										<span class="font-medium text-foreground"
											>Lots: {lotsLabel(auction._count.lots)}</span
										>
										{#if auction.start}
											<span>Started {formatDate(auction.start)}</span>
										{/if}
										{#if auction.end}
											<span>Ends {formatDate(auction.end)}</span>
										{/if}
									</div>
								{/snippet}

								{#snippet actionSnippet()}
									<Button variant="link" href={`/auction-house/auctions/${auction.id}`}>
										Details
									</Button>
								{/snippet}
							</Item>
						{/each}
					</div>
				{/if}
			</CardWrapper>

			<CardWrapper title="Upcoming auctions" description="Preview what launches soon">
				{#if upcomingAuctions.length === 0}
					<Empty
						title="No scheduled auctions"
						description="Schedule a new auction to populate this list."
					/>
				{:else}
					<div class="grid gap-3">
						{#each upcomingAuctions as auction}
							<Item variant="outline">
								{#snippet header()}
									<div class="flex flex-wrap items-center gap-2 text-xs">
										<Badge variant="outline">{humanize(auction.type)}</Badge>
										<Badge variant={statusBadgeVariant(auction.status)}>
											{humanize(auction.status)}
										</Badge>
									</div>
								{/snippet}

								{#snippet title()}
									<div class="flex flex-col gap-1">
										<span class="text-base font-semibold">{auction.title}</span>
									</div>
								{/snippet}

								{#snippet footer()}
									<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
										<span class="font-medium text-foreground"
											>Lots: {lotsLabel(auction._count.lots)}</span
										>
										{#if auction.start}
											<span>Starts {formatDate(auction.start)}</span>
										{:else}
											<span>Start date TBD</span>
										{/if}
										{#if auction.end}
											<span>Ends {formatDate(auction.end)}</span>
										{/if}
									</div>
								{/snippet}

								{#snippet actionSnippet()}
									<Button variant="link" href={`/auction-house/auctions/${auction.id}`}>
										Details
									</Button>
								{/snippet}
							</Item>
						{/each}
					</div>
				{/if}
			</CardWrapper>
		</div>

		<CardWrapper title="Recently closed" description="Last four completed auctions">
			{#if recentCompletedAuctions.length === 0}
				<Empty
					title="No past auctions"
					description="Completed auctions will appear here once available."
				/>
			{:else}
				<div class="grid gap-3">
					{#each recentCompletedAuctions as auction}
						<Item variant="outline">
							{#snippet header()}
								<div class="flex flex-wrap items-center gap-2 text-xs">
									<Badge variant="outline">{humanize(auction.type)}</Badge>
									<Badge variant={statusBadgeVariant(auction.status)}>
										{humanize(auction.status)}
									</Badge>
								</div>
							{/snippet}

							{#snippet title()}
								<div class="flex flex-col gap-1">
									<span class="text-base font-semibold">{auction.title}</span>
									<p class="text-sm text-muted-foreground">
										{auction.description || 'Summary unavailable.'}
									</p>
								</div>
							{/snippet}

							{#snippet footer()}
								<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
									<span class="font-medium text-foreground"
										>Lots: {lotsLabel(auction._count.lots)}</span
									>
									{#if auction.start}
										<span>Started {formatDate(auction.start)}</span>
									{/if}
									{#if auction.end}
										<span>Ended {formatDate(auction.end)}</span>
									{/if}
								</div>
							{/snippet}

							{#snippet actionSnippet()}
								<Button variant="link" href={`/auction-house/auctions/${auction.id}`}>
									Details
								</Button>
							{/snippet}
						</Item>
					{/each}
				</div>
			{/if}
		</CardWrapper>
	</div>
</PageWrapper>

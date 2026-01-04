<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import { able } from '$lib/utils/auth/able.svelte.js';
	import { SquarePen } from '@lucide/svelte';
	import { format } from 'date-fns';

	let { data } = $props();
	let entity = $derived(data.entity);
	let combine = $derived(
		typeof entity.combineData === 'string'
			? JSON.parse(entity.combineData)
			: (entity.combineData ?? {})
	);
	let priceCredits = $derived(combine?.price?.credits ?? null);

	const formatCredits = (value: string | number | null) => {
		if (value == null) return 'N/A';
		const num = typeof value === 'string' ? Number(value) : value;
		if (Number.isNaN(num)) return String(value);
		return new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 0
		}).format(num);
	};
</script>

<PageWrapper title={entity.name} crumbOverrides={[[entity.id, entity.name]]}>
	<CardWrapper title={entity.name} description={entity.type.toUpperCase()}>
		{#snippet header()}
			{#if able(['DEVELOPER', 'TZAR'])}
				<Button size="sm" variant="outline" href={`/holochain/database/${entity.id}/edit`}>
					<SquarePen />
					Edit
				</Button>
			{/if}
		{/snippet}

		<div class="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]">
			<div class="flex flex-col gap-4">
				<div class="flex items-start gap-4">
					<img
						src={entity.imageSmall}
						alt={entity.name}
						class="size-20 shrink-0 rounded-md border bg-muted object-cover"
					/>
					<div class="space-y-1 text-sm text-muted-foreground">
						<div>
							<span class="font-medium text-foreground">Type:</span>
							<span class="ml-2 capitalize">{entity.type}</span>
						</div>
						{#if combine.class?.attributes?.value}
							<div>
								<span class="font-medium text-foreground">Class:</span>
								<span class="ml-2">{combine.class.attributes.value}</span>
							</div>
						{/if}
						{#if combine.speed?.planetary?.value}
							<div>
								<span class="font-medium text-foreground">Speed:</span>
								<span class="ml-2">
									{combine.speed.planetary.value}
									{combine.speed.planetary.attributes.units}
								</span>
							</div>
						{/if}
					</div>
				</div>
				{#if priceCredits}
					<div class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
						<div class="flex items-baseline justify-between gap-3">
							<div class="space-y-0.5">
								<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
									Base Production Cost
								</p>
								<p class="text-lg font-semibold text-foreground">
									{formatCredits(priceCredits)} credits
								</p>
							</div>
							{#if entity.transactions?.length}
								<p class="text-xs text-muted-foreground">
									{entity.transactions.length} transaction{entity.transactions.length === 1
										? ''
										: 's'} recorded
								</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
			<div class="overflow-hidden rounded-md border bg-background">
				<img src={entity.imageLarge} alt={entity.name} class="h-full w-full object-cover" />
			</div>
		</div>
	</CardWrapper>

	{#if entity.transactions?.length}
		<CardWrapper title="Transactions">
			<Table.Root class="mt-2">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[140px]">Date</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head class="text-right">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each entity.transactions as tx}
						<Table.Row>
							<Table.Cell class="text-xs whitespace-nowrap text-muted-foreground">
								{format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm')}
							</Table.Cell>
							<Table.Cell class="capitalize">
								<Badge variant="secondary">{tx.type.toLowerCase()}</Badge>
							</Table.Cell>
							<Table.Cell class="text-right font-medium tabular-nums">
								{formatCredits(tx.value)}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardWrapper>
	{:else}
		<CardWrapper title="Transactions">
			<Empty title="No Transactions Recorded" />
		</CardWrapper>
	{/if}
</PageWrapper>

<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		title?: string;
		description?: string | Snippet;
		footer?: string | Snippet;
		header?: Snippet;
	};

	let { children, title, description, footer, header }: Props = $props();

	let mobile = new IsMobile();
</script>

<Card.Root class={cn(mobile.current && 'border-none bg-transparent p-0 shadow-none')}>
	<Card.Header class={cn(mobile.current && 'mt-4 p-0')} hidden={!title && !description}>
		<Card.Title hidden={!title}>
			<div class="flex w-full items-center justify-between">
				<h3>{title}</h3>
				<div class="flex items-center gap-4">
					{@render header?.()}
				</div>
			</div>
		</Card.Title>
		<Card.Description hidden={!description}>
			{#if typeof description === 'string'}
				<p>{description}</p>
			{:else}
				{@render description?.()}
			{/if}
		</Card.Description>
	</Card.Header>
	<Card.Content hidden={!children} class={cn('h-full', mobile.current && 'p-0')}>
		{@render children?.()}
	</Card.Content>
	<Card.Footer class={cn('text-muted-foreground', mobile.current && 'p-0')} hidden={!footer}>
		{#if typeof footer === 'string'}
			<small>{footer}</small>
		{:else}
			{@render footer?.()}
		{/if}
	</Card.Footer>
</Card.Root>

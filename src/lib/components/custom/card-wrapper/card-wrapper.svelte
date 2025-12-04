<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		title?: string;
		description?: string;
		titleContainerClass?: string;
		footer?: string | Snippet;
		header?: Snippet;
	};

	let { children, title, description, footer, header, titleContainerClass }: Props = $props();

	let mobile = new IsMobile();
</script>

<Card.Root class={cn(mobile.current && 'border-none bg-transparent p-0 shadow-none')}>
	<Card.Header class={cn(mobile.current && 'mt-4 p-0')} hidden={!title && !description}>
		<Card.Title hidden={!title}>
			<div class={cn('flex w-full items-start justify-between', titleContainerClass)}>
				<div class="flex flex-col gap-1">
					<h3>{title}</h3>
					<span hidden={!description} class="text-sm text-muted-foreground">{description}</span>
				</div>
				{@render header?.()}
			</div>
		</Card.Title>
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

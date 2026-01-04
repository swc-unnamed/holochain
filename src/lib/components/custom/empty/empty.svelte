<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { variants } from './empty-variants.svelte';
	import type { EmptyProps } from './empty.types';

	let {
		variant = 'default',
		content,
		title,
		description,
		Icon,
		iconSnippet
	}: EmptyProps = $props();
</script>

<Empty.Root class={variants[variant].containerClass}>
	<Empty.Header>
		<Empty.Media variant="icon">
			{#if !iconSnippet}
				{@const RenderedIcon = Icon || variants[variant].icon}
				<RenderedIcon class={variants[variant].iconClass} />
			{:else}
				{@render iconSnippet?.()}
			{/if}
		</Empty.Media>
		<Empty.Title>{title || variants[variant].title}</Empty.Title>
		<Empty.Description>{description || variants[variant].description}</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		{#if !content}
			{@const ContentComponent = variants[variant].content ?? null}
			{#if !ContentComponent}
				<!-- No content -->
			{:else}
				<ContentComponent />
			{/if}
		{:else}
			{@render content?.()}
		{/if}
	</Empty.Content>
</Empty.Root>

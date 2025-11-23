<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import Button, { type ButtonVariant } from '$lib/components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';
	import type { ItemVariant } from '$lib/components/ui/item/item.svelte';

	type Props = {
		header?: string | Snippet;
		media?: Snippet;
		action?: {
			variant?: ButtonVariant;
			text: string;
			onClick: () => any;
		};
		actionSnippet?: Snippet;
		title?: string | Snippet;
		description?: string | Snippet;
		footer?: string | Snippet;
		variant?: ItemVariant;
	};

	let { header, media, title, description, action, actionSnippet, footer, variant }: Props =
		$props();
</script>

<Item.Root class="shadow-xs" variant={variant ?? 'default'}>
	<Item.Header hidden={!header}>
		{#if typeof header === 'string'}
			<h4>{header}</h4>
		{:else}
			{@render header?.()}
		{/if}
	</Item.Header>

	<Item.Media class="my-auto" hidden={!media}>
		{@render media?.()}
	</Item.Media>
	<Item.Content>
		<Item.Title hidden={!title}>
			{#if typeof title === 'string'}
				<h5>{title}</h5>
			{:else}
				{@render title?.()}
			{/if}
		</Item.Title>
		<Item.Description hidden={!description}
			>{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description?.()}
			{/if}</Item.Description
		>
	</Item.Content>

	<Item.Actions hidden={!action && !actionSnippet}
		>{#if action?.text}
			<Button variant={action.variant || 'default'} onclick={() => action.onClick?.()}
				>{action.text}</Button
			>
		{:else if actionSnippet}
			{@render actionSnippet()}
		{/if}</Item.Actions
	>
	<Item.Footer hidden={!footer}>
		{#if typeof footer === 'string'}
			{footer}
		{:else}
			{@render footer?.()}
		{/if}
	</Item.Footer>
</Item.Root>

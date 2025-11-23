<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		title: string | Snippet;
		description?: string | Snippet | undefined;
		trigger?: string | Snippet;
		children: Snippet;
		footer: Snippet;
		open: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	const isMobile = new IsMobile();

	let {
		title,
		description,
		children,
		footer,
		open = $bindable(false),
		onOpenChange = $bindable(),
		trigger
	}: Props = $props();
</script>

{#if isMobile.current}
	<Drawer.Root bind:open {onOpenChange}>
		<Drawer.Trigger hidden={!trigger}>
			{#if typeof trigger === 'string'}
				{trigger}
			{:else}
				{@render trigger?.()}
			{/if}
		</Drawer.Trigger>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title?.()}
					{/if}
				</Drawer.Title>
				<Drawer.Description hidden={!description}>
					{#if description}
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description?.()}
						{/if}
					{/if}
				</Drawer.Description>
			</Drawer.Header>

			<div class="px-4">
				{@render children()}
			</div>

			<Drawer.Footer>
				{@render footer?.()}
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}

{#if !isMobile.current}
	<Dialog.Root bind:open {onOpenChange}>
		<Dialog.Trigger hidden={!trigger}>
			{#if typeof trigger === 'string'}
				{trigger}
			{:else}
				{@render trigger?.()}
			{/if}
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title?.()}
					{/if}
				</Dialog.Title>
				<Dialog.Description hidden={!description}>
					{#if description}
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description?.()}
						{/if}
					{/if}
				</Dialog.Description>
			</Dialog.Header>

			<div>
				{@render children()}
			</div>

			<Dialog.Footer>
				{@render footer?.()}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

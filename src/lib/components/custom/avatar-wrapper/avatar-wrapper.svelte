<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { createAvatar } from '@dicebear/core';
	import { bottts, rings } from '@dicebear/collection';
	import { page } from '$app/state';

	type Props = {
		image: string | Snippet | null;
		fallback?: string | Snippet;
		class?: string;
	};

	let { image = $bindable(), fallback = '?', class: className }: Props = $props();
</script>

<Avatar.Root class={cn('size-12 rounded-md', className)}>
	{#if typeof image === 'string'}
		<Avatar.Image class="rounded-md" src={image} alt="Avatar" />
	{:else}
		{@render image?.()}
	{/if}
	{#if fallback}
		{#if typeof fallback === 'string'}
			<Avatar.Fallback class="rounded-xl">{fallback}</Avatar.Fallback>
		{:else}
			{@render fallback?.()}
		{/if}
	{/if}
</Avatar.Root>

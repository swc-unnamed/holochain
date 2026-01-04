<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import type { HTMLFormAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		inputClass,
		value = $bindable(''),
		...restProps
	}: WithElementRef<HTMLFormAttributes> & { value: string; inputClass?: string } = $props();
</script>

<form bind:this={ref} {...restProps}>
	<Sidebar.Group class="py-0">
		<Sidebar.GroupContent class="relative">
			<Label for="search" class="sr-only">Search</Label>
			<Sidebar.Input
				bind:value
				id="search"
				placeholder={restProps.placeholder || 'Search the Holochain...'}
				class={cn('pl-8 text-secondary-foreground', inputClass)}
			/>
			<SearchIcon
				class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-primary opacity-50 select-none dark:text-accent"
			/>
		</Sidebar.GroupContent>
	</Sidebar.Group>
</form>

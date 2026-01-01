<script lang="ts">
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { SvelteComponent } from 'svelte';

	type Props = {
		ctr: number;
		class?: string;
		iconClass?: string;
		rootClass?: string;
	};

	let { ctr, class: className, iconClass, rootClass }: Props = $props();
</script>

<div class={cn('flex items-center gap-0.5', rootClass)}>
	<Icon
		icon={ctr > 0 ? 'mdi:chevron-double-up' : 'mdi:chevron-double-down'}
		class={cn(ctr > 0 ? 'text-primary' : 'text-destructive', iconClass)}
	/>
	<p class={className}>{ctr}</p>
</div>

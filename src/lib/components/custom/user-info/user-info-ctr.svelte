<script lang="ts">
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { SvelteComponent } from 'svelte';

	type Props = {
		ctr: number;
		class?: string;
		iconClass?: string;
	};

	let { ctr, class: className, iconClass }: Props = $props();
</script>

<div class={cn('flex items-center gap-0.5')}>
	<Icon
		icon={ctr > 0 ? 'mdi:chevron-double-up' : 'mdi:chevron-double-down'}
		class={cn(ctr > 0 ? 'text-primary' : 'text-destructive', iconClass)}
	/>
	<p class={className}>{ctr}</p>
</div>

<script lang="ts">
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';

	type Prop = {
		karma: number;
		class?: string;
	};

	let { karma, class: className }: Prop = $props();

	let color = $state('text-primary');
	if (karma >= 1000) {
		color = 'text-green-500';
	} else if (karma >= 500) {
		color = 'text-blue-500';
	} else if (karma >= 100) {
		color = 'text-primary';
	} else if (karma < 0) {
		color = 'text-red-500';
	} else {
		color = 'text-primary';
	}
</script>

<div class="flex items-center">
	{#if karma >= 0}
		<Icon icon="lucide:arrow-big-up-dash" class={cn(color, className)} />
	{/if}
	{#if karma < 0}
		<Icon icon="lucide:arrow-big-down-dash" class={cn(color, className)} />
	{/if}
	<span class={cn('ml-1 font-medium', color)}>{karma}</span>
</div>

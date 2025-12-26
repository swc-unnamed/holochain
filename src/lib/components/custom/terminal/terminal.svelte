<script lang="ts">
	import { Window } from '$lib/components/custom/window';
	import { cn } from '$lib/utils.js';
	import { useTerminalRoot } from './terminal.svelte.js';
	import { onMount } from 'svelte';
	import type { TerminalRootProps } from './types.js';

	let {
		delay = 0,
		speed = 1,
		onComplete = () => {},
		children,
		class: className,
		title
	}: TerminalRootProps = $props();

	const terminal = useTerminalRoot({ delay, speed, onComplete });

	onMount(() => {
		// we play here so that we don't play before it is visible (on the server)
		terminal.play();

		return () => {
			terminal.dispose();
		};
	});
</script>

<!-- <div class={cn('font-mono text-sm font-light', className)}>
	{@render children?.()}
</div> -->
<Window class={cn('font-mono text-sm font-light', className)} {title}>
	{@render children?.()}
</Window>

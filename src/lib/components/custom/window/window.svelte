<script lang="ts" module>
	import type { WithChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	export type WindowPropsWithoutHTML = WithChildren & {
		contentClass?: string;
		title?: string;
	};

	export type WindowProps = HTMLAttributes<HTMLDivElement> & WindowPropsWithoutHTML;
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { children, class: className, contentClass, title }: WindowProps = $props();
</script>

<div class={cn('aspect-video w-full rounded-lg border border-border bg-background', className)}>
	<div class="border-b border-inherit p-4">
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center gap-2">
				<div class="size-2 rounded-full bg-[#ef4444]"></div>
				<div class="size-2 rounded-full bg-[#eab308]"></div>
				<div class="size-2 rounded-full bg-[#22c55e]"></div>
			</div>
			{#if title}
				<span class="justify-end">Unnamed Market</span>
			{/if}
		</div>
	</div>
	<div class={cn('p-4', contentClass)}>
		{@render children?.()}
	</div>
</div>

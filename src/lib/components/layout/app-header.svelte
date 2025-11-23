<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';
	import { type Snippet } from 'svelte';
	import Button from '../ui/button/button.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	interface SiteHeaderProps {
		crumbPageTitle?: string;

		crumbOverrides?:
			| ReadonlyMap<string, string>
			| ReadonlyArray<readonly [string, string]>
			| Record<string, string>;
		header?: Snippet;
	}

	let { crumbPageTitle, crumbOverrides, header }: SiteHeaderProps = $props();

	const mobile = new IsMobile();

	function toMap(src?: SiteHeaderProps['crumbOverrides']): ReadonlyMap<string, string> {
		if (!src) return new Map();
		if (src instanceof Map) return src;
		if (Array.isArray(src)) return new Map(src as [string, string][]);
		return new Map(Object.entries(src));
	}
	const overridesMap = $derived.by(() => toMap(crumbOverrides));

	const segments = $derived.by(() => page.url.pathname.split('/').filter(Boolean));
	const prevSegments = $derived.by(() => segments.slice(0, -1));
	const currentSegment = $derived.by(() => segments.at(-1) ?? 'home');

	function crumbTrail(index: number): string {
		return '/' + segments.slice(0, index + 1).join('/');
	}

	function labelFor(seg: string): string {
		const hit = overridesMap.get(seg);
		if (hit) return hit;

		return seg.replace(/[-_]+/g, ' ').toUpperCase();
	}

	const currentLabel = $derived.by(() =>
		crumbPageTitle ? crumbPageTitle : labelFor(currentSegment)
	);
</script>

<header
	class=" flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		{#if !mobile.current}
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#each prevSegments as seg, i}
						<Breadcrumb.Item>
							<Breadcrumb.Link href={crumbTrail(i)}>{labelFor(seg)}</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
					{/each}

					<Breadcrumb.Item>
						<Breadcrumb.Page class="font-bold">
							{typeof currentLabel === 'string' ? currentLabel.toUpperCase() : currentLabel}
						</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		{/if}

		{#if mobile.current}
			<div class="flex w-full items-center justify-start gap-2">
				<img src="/images/uim-18.png" class="size-6" alt="logo" />
				<span class="font-bold">
					<!-- {typeof currentLabel === 'string' ? currentLabel.toUpperCase() : currentLabel} -->
					Unnamed Holochain
				</span>
			</div>
		{/if}

		<div class="ml-auto flex items-center gap-2">
			{@render header?.()}
		</div>
	</div>
</header>

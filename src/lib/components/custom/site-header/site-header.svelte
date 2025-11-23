<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { page } from '$app/state';
	import type { SiteHeaderProps } from './site-header.types';

	let { crumbPageTitle, crumbOverrides, header }: SiteHeaderProps = $props();

	function toMap(src?: SiteHeaderProps['crumbOverrides']): ReadonlyMap<string, string> {
		if (!src) return new Map();
		if (src instanceof Map) return src;
		if (Array.isArray(src)) return new Map(src as [string, string][]);
		return new Map(Object.entries(src));
	}
	const overridesMap = $derived.by(() => toMap(crumbOverrides));

	const segments = $derived.by(() => page.url.pathname.split('/').filter((s) => s && s !== 'app'));
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

<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
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
	<div class="ml-auto flex items-center gap-2">
		{@render header?.()}
	</div>
</header>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import AppHeader from '../../layout/app-header.svelte';
	import type { PageWrapperProps } from './page-wrapper.types';
	import type { SiteHeaderProps } from '../site-header/site-header.types';

	let {
		title,
		children,
		header,
		crumbOverrides
	}: PageWrapperProps & {
		crumbOverrides?: SiteHeaderProps['crumbOverrides'];
	} = $props();
</script>

<svelte:head>
	<title>{title ? `${title} | Unnamed Market` : 'Unnamed Market'}</title>
</svelte:head>

<Sidebar.Inset class="rounded-lg border ">
	<AppHeader {header} {crumbOverrides} />
	<div class="flex flex-1 flex-col gap-4 p-4">
		{@render children()}
	</div>
</Sidebar.Inset>

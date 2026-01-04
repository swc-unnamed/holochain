import type { Snippet } from 'svelte';

interface SiteHeaderProps {
	crumbPageTitle?: string;

	crumbOverrides?:
		| ReadonlyMap<string, string>
		| ReadonlyArray<readonly [string, string]>
		| Record<string, string>;
	header?: Snippet;
}

export type { SiteHeaderProps };

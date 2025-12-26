<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { hasRole } from '$lib/utils/helpers/auth/has-role';
	import type { ComponentProps } from 'svelte';
	import NavRouteTree from './nav-route-tree.svelte';
	import NavFooter from './app-footer.svelte';
	import { NAVIGATION_ROUTES } from './routes';
	import { able } from '$lib/utils/auth/able.svelte';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { SvelteURL } from 'svelte/reactivity';
	import { Separator } from '../ui/separator';
	import UserAvatar from '../custom/user-avatar/user-avatar.svelte';
	import SearchForm from '../custom/search-form/search-form.svelte';
	import { mode } from 'mode-watcher';
	import { Badge } from '../ui/badge';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { toast } from 'svelte-sonner';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
	const url = $derived(new SvelteURL(page.url));
	const mobile = new IsMobile();
	const sidebar = useSidebar();

	function isActiveRoute(currentPath: string, routePath: string): boolean {
		const cur = currentPath.replace(/\/+$/, '');
		const route = routePath.replace(/\/+$/, '');

		// exact match (fast path)
		if (cur === route) return true;

		const regex = new RegExp(
			'^' +
				route
					.split('/')
					.map((part) => (part.startsWith('[') && part.endsWith(']') ? '[^/]+' : part))
					.join('/') +
				'$'
		);

		return regex.test(cur);
	}

	let searchTerm: string = $state('');

	let shownRoutes = $derived.by(() => {
		if (searchTerm.trim() === '') {
			return NAVIGATION_ROUTES;
		}

		const lowerSearchTerm = searchTerm.toLowerCase();

		return NAVIGATION_ROUTES.map((route) => {
			const filteredItems = route.items?.filter((item) =>
				item.title.toLowerCase().includes(lowerSearchTerm)
			);

			if (
				route.title.toLowerCase().includes(lowerSearchTerm) ||
				(filteredItems && filteredItems.length > 0)
			) {
				return {
					...route,
					items: filteredItems
				};
			}

			return null;
		}).filter((route) => route !== null) as typeof NAVIGATION_ROUTES;
	});
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas" {...restProps}>
	<Sidebar.Header class="rounded-t-xl">
		<button
			class="flex flex-col rounded-xl p-3 text-left hover:cursor-pointer hover:bg-background/50"
		>
			<div class="flex items-center gap-2">
				<UserAvatar id={page.data.user.id} class="size-8" />
				<div class="flex flex-col gap-0">
					<span class="truncate">{page.data.user.displayName}</span>
					<span class="text-xs text-muted-foreground">Personal Account</span>
				</div>
			</div>
		</button>

		<Separator />
	</Sidebar.Header>
	<SearchForm
		inputClass={cn(mode.current === 'light' && 'bg-input! border-2 opacity-100 ')}
		bind:value={searchTerm}
	/>
	<Sidebar.Content>
		<!-- <Sidebar.Group>
			<Sidebar.Menu>
				{#each getOrganizationNavigationRoutes( { name: 'Unnamed Market', slug: 'uim' } ) as item (item.title)}
					{#if able(item.permission)}
						<Sidebar.GroupLabel>
							<Icon class="mr-1 text-muted-foreground/50" icon={item.icon!} />
							<span class="text-sm">{item.title}</span>
						</Sidebar.GroupLabel>
						{#if item.items && item.items.length > 0}
							<Sidebar.MenuSub>
								{#each item.items ?? [] as subItem (subItem.title)}
									{#if able(subItem.permission)}
										{@const isActive = subItem.url.split('/').pop() === activeRoute}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton class={cn(isActive && 'bg-accent')}>
												{#snippet child({ props })}
													<a href={subItem.url} {...props}>
														<span>{subItem.title}</span>
													</a>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/if}
								{/each}
							</Sidebar.MenuSub>
						{/if}
					{/if}
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group> -->
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each shownRoutes as item (item.title)}
					{#if able(item.role)}
						<Sidebar.GroupLabel
							><Icon class="mr-1 text-accent dark:text-muted-foreground/50" icon={item.icon!} />
							<div class="flex w-full items-center justify-between text-sm">
								<span>{item.title}</span>
								{#if item.flag}
									<span class="rounded-md border px-3 py-1 text-xs text-primary"
										>{item.flag.toUpperCase()}</span
									>
								{/if}
							</div>
						</Sidebar.GroupLabel>
						{#if item.items && item.items.length > 0}
							<Sidebar.MenuSub>
								{#each item.items ?? [] as subItem (subItem.title)}
									{#if able(subItem.role)}
										{@const isActive = isActiveRoute(url.pathname, subItem.url)}

										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												class={cn(
													isActive &&
														'bg-sidebar-accent text-primary dark:bg-primary dark:text-primary-foreground',
													'hover:text-foreground'
												)}
											>
												{#snippet child({ props })}
													<a
														href={subItem.url}
														{...props}
														onclick={() => {
															if (mobile.current) {
																sidebar.setOpenMobile(false);
															}
														}}
													>
														<div class="flex w-full items-center justify-between text-sm">
															<span>{subItem.title}</span>
															{#if subItem.flag}
																{#if !isActive}
																	<span class="rounded-md border px-3 py-1 text-xs">
																		{subItem.flag.toUpperCase()}
																	</span>
																{/if}
															{/if}
														</div>
													</a>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/if}
								{/each}
							</Sidebar.MenuSub>
						{/if}
					{/if}
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="rounded-b-xl">
		<Separator />
		<NavFooter />
	</Sidebar.Footer>
</Sidebar.Root>

<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import type { Route } from '$lib/types/general/route.type';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import { goto, preloadData } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { openInNewTab } from '$lib/utils/helpers/shared/open-in-new-tab';
	import { hasRole } from '$lib/utils/helpers/auth/has-role';

	let { routes, groupLabel }: { routes: Route[]; groupLabel: string } = $props();
	const sidebar = useSidebar();
	let isOpen = $derived(sidebar.open);
</script>

<Sidebar.Group class="">
	<Sidebar.GroupLabel class="text-sm ">{groupLabel}</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each routes as route (route.title)}
			{@const isActive = route.href.startsWith(page.url.pathname)}
			{#if hasRole('')}
				<Collapsible.Root class="group/collapsible">
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Collapsible.Trigger
								onmouseover={async () => {
									if (!route.nested?.length || !isOpen) {
										preloadData(route.href);
									}
								}}
								onclick={async () => {
									if (!route?.nested?.length || !isOpen) {
										await goto(route.href);
									}
								}}
							>
								{#snippet child({ props })}
									<Sidebar.MenuButton
										class={cn(
											'text-base',
											isActive && 'bg-primary/70 text-secondary-foreground',
											route.nested?.find((r) => r.href === page.url.pathname) &&
												'bg-primary text-secondary-foreground'
										)}
										onauxclick={() => openInNewTab(route.href)}
										{...props}
									>
										{#snippet tooltipContent()}
											{route.title}
										{/snippet}
										{#if route.icon}
											<Icon class={'text-xl'} icon={route.icon} />
										{/if}
										<span>{route.title} {route.flag}</span>
										{#if route?.nested?.length}
											<ChevronRight
												class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
											/>
										{/if}
									</Sidebar.MenuButton>
								{/snippet}
							</Collapsible.Trigger>

							<Collapsible.Content>
								{#if route.nested}
									<Sidebar.MenuSub>
										{#each route.nested as subItem (subItem.title)}
											{#if hasRole('')}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton onauxclick={() => openInNewTab(subItem.href)}>
														{#snippet child({ props })}
															<a href={subItem.href} {...props}>
																<Icon icon={subItem.icon} />
																<span>{subItem.title} - {subItem.flag}</span>
															</a>
														{/snippet}
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/if}
										{/each}
									</Sidebar.MenuSub>
								{/if}
							</Collapsible.Content>
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/if}
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

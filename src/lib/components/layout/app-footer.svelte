<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { toast } from 'svelte-sonner';
	import Button from '../ui/button/button.svelte';
	import { RssIcon, UserIcon, LogOut } from '@lucide/svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { logout } from '$lib/remote/auth/logout.remote';
	import { goto } from '$app/navigation';

	const sidebar = useSidebar();
	const mobile = new IsMobile();

	const VERSION = 'v0.3.0';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<div class="mt-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<img src="/images/uim-18.png" alt="logo" class="size-10" />
				<div class="flex flex-col gap-0 leading-0">
					<span class="text-sm font-bold">Holochain</span>
					<span class="text-xs text-muted-foreground"> {VERSION} </span>
				</div>
			</div>
			<div>
				<Button
					variant="outline"
					size="icon"
					onclick={() => {
						toast('Notifications', {
							description: "Notifications are coming soon, we just haven't built them yet!"
						});

						if (mobile.current) {
							sidebar.setOpenMobile(false);
						}
					}}
				>
					<RssIcon />
				</Button>
				<Button
					variant="outline"
					size="icon"
					href="/account"
					onclick={() => {
						if (mobile.current) {
							sidebar.setOpenMobile(false);
						}
					}}
				>
					<UserIcon />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={async () => {
						await logout();
						await goto('/auth/login');
					}}
				>
					<LogOut />
				</Button>
			</div>
		</div>
	</Sidebar.MenuItem>
</Sidebar.Menu>

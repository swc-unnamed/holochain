<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { toast } from 'svelte-sonner';
	import Button from '../ui/button/button.svelte';
	import { HeartIcon, MessageSquareIcon, MoonIcon, RssIcon, UserIcon } from '@lucide/svelte';
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<div class="mt-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<img src="/images/uim-18.png" alt="logo" class="size-10" />
				<div class="flex flex-col gap-0 leading-0">
					<span class="text-sm font-bold">Holochain</span>
					<span class="text-xs text-muted-foreground"> v26.01 </span>
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
					}}
				>
					<RssIcon />
				</Button>
				<Button variant="outline" size="icon" href="/account">
					<UserIcon />
				</Button>
			</div>
		</div>
	</Sidebar.MenuItem>
</Sidebar.Menu>

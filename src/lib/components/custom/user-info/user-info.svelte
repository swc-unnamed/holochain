<script lang="ts">
	import AvatarWrapper from '../avatar-wrapper/avatar-wrapper.svelte';
	import UserInfoCtr from './user-info-ctr.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card';

	type Props = {
		ctr: number;
		displayName: string;
		avatarUrl: string;
	};

	let { ctr, displayName, avatarUrl }: Props = $props();
</script>

<div class="flex w-full items-center gap-2 rounded-md border p-2">
	<AvatarWrapper image={avatarUrl} />
	<div class="flex flex-col">
		<p>{displayName}</p>
		<UserInfoCtr {ctr} class="text-xs" />
	</div>
</div>

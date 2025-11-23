<script lang="ts">
	import { getUserAvatar } from '$lib/remote/users/get-avatar.remote';
	import AvatarWrapper from '../avatar-wrapper/avatar-wrapper.svelte';

	type Props = {
		id: string;
		class?: string;
	};

	let { id, class: className }: Props = $props();

	const avatar = $state(await getUserAvatar({ id: id }));
</script>

<AvatarWrapper image={avatar} class={className} />

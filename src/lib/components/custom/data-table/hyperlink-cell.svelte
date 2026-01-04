<script lang="ts">
	import Icon from '@iconify/svelte';

	type Props = {
		text: string;
		href: string;
		rest?: HTMLAnchorElement['attributes'];
	};
	let { text, href, ...rest }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<a {...rest} {href}>{text}</a>
	<Icon class="text-primary" icon="mdi:external-link" />
</div>

<script lang="ts">
	type Props = {
		src?: string;
		alt?: string;
		rest?: HTMLImageElement['attributes'];
	};

	let { src, alt, ...rest }: Props = $props();
</script>

<div class="">
	<img class="size-12 border" {src} {alt} {...rest} />
</div>

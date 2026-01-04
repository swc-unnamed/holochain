<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { ItemSwitchProps } from './item-switch.types';

	let {
		label,
		description,
		variant = 'outline',
		checked = $bindable(false),
		...props
	}: ItemSwitchProps = $props();
</script>

<Item.Root {variant}>
	<Item.Content>
		<Item.Title>
			{label}
		</Item.Title>
		<Item.Description hidden={!description}>
			{description}
		</Item.Description>
	</Item.Content>
	<Item.Actions>
		<Switch {...props} bind:checked />
	</Item.Actions>
</Item.Root>

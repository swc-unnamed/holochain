<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import Switch from '$lib/components/ui/switch/switch.svelte';

	import { cn } from '$lib/utils';
	import { STYLES } from '../styles';
	import type { SwitchInputProps } from './switch-input.types';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		issues = $bindable(),
		checked = $bindable(false),
		...props
	}: SwitchInputProps = $props();

	let _issues = $derived.by(() => {
		if (Array.isArray(issues)) {
			return issues.map((e) => e.message);
		} else if (typeof issues === 'string' && issues.length > 0) {
			return [issues];
		}
		return [];
	});
</script>

<Field class={STYLES.checkboxOrToggle.field}>
	<div>
		<div class="flex items-center gap-1">
			<Switch bind:checked />
			<div>
				<FieldLabel class={STYLES.input.label} hidden={!label && !labelSnippet}
					>{label}
					{@render labelSnippet?.()}
					{#if props.required}
						<span class="m-0 p-0 text-destructive" title="required">*</span>
					{/if}
				</FieldLabel>

				<FieldDescription
					hidden={!description && !descriptionSnippet}
					class={STYLES.input.description}
					>{description}
					{@render descriptionSnippet?.()}
				</FieldDescription>
			</div>
		</div>

		<FieldError
			hidden={!_issues?.length}
			class={cn(STYLES.checkboxOrToggle.error, STYLES.input.error)}>{_issues.join(', ')}</FieldError
		>
	</div>
</Field>

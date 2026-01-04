<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { STYLES } from '../styles';
	import MultiSelect from './multi-select.svelte';
	import type { SelectInputProps } from './select-input.types';
	import SingleSelect from './single-select.svelte';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		issues = $bindable(),
		value = $bindable(),
		...props
	}: SelectInputProps = $props();

	let _issues = $derived.by(() => {
		if (Array.isArray(issues)) {
			return issues.map((e) => e.message);
		} else if (typeof issues === 'string' && issues.length > 0) {
			return [issues];
		}
		return [];
	});
</script>

<Field>
	<FieldLabel class="grid gap-3" hidden={!label && !labelSnippet}>
		<div class={STYLES.input.label}>
			{label}
			{@render labelSnippet?.()}
			{#if props.required}
				<span class="m-0 p-0 text-destructive" title="required">*</span>
			{/if}
		</div>
		{#if props.type === 'single'}
			<SingleSelect bind:value={value as string} {...props} />
		{:else if props.type === 'multiple'}
			<MultiSelect bind:value={value as string[]} {...props} />
		{/if}
	</FieldLabel>

	<FieldError hidden={!_issues?.length} class={STYLES.input.error}>{_issues.join(', ')}</FieldError>
	<FieldDescription hidden={!description && !descriptionSnippet} class={STYLES.input.description}
		>{description}
		{@render descriptionSnippet?.()}
	</FieldDescription>
</Field>

<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input';
	import { STYLES } from '../styles';
	import type { FieldInputProps } from './field-input.types';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		issues = $bindable(),
		value = $bindable(),
		...props
	}: FieldInputProps = $props();

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
	</FieldLabel>
	<Input aria-invalid={!!(issues?.length && issues.length > 0)} bind:value {...props} />

	<FieldError hidden={!_issues?.length} class={STYLES.input.error}>{_issues.join(', ')}</FieldError>
	<FieldDescription hidden={!description && !descriptionSnippet} class={STYLES.input.description}
		>{description}
		{@render descriptionSnippet?.()}
	</FieldDescription>
</Field>

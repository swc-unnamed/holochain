<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { STYLES } from '../styles';
	import type { TextareaInputProps } from './textarea-input.types';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		fieldClass,
		issues = $bindable(),
		value = $bindable(),
		...props
	}: TextareaInputProps = $props();

	let _issues = $derived.by(() => {
		if (Array.isArray(issues)) {
			return issues.map((e) => e.message);
		} else if (typeof issues === 'string' && issues.length > 0) {
			return [issues];
		}
		return [];
	});
</script>

<Field class={fieldClass}>
	<FieldLabel class="grid gap-3" hidden={!label && !labelSnippet}>
		<div class={STYLES.input.label}>
			{label}
			{@render labelSnippet?.()}
			{#if props.required}
				<span class="m-0 p-0 text-destructive" title="required">*</span>
			{/if}
		</div>

		<Textarea aria-invalid={!!(issues?.length && issues.length > 0)} bind:value {...props} />
	</FieldLabel>

	<FieldError hidden={!_issues?.length} class={STYLES.input.error}>{_issues.join(', ')}</FieldError>
	<FieldDescription hidden={!description && !descriptionSnippet} class={STYLES.input.description}
		>{description}
		{@render descriptionSnippet?.()}
	</FieldDescription>
</Field>

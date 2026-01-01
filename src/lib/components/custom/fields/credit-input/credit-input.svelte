<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { STYLES } from '../styles';
	import type { FieldInputProps } from '../field-input/field-input.types';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';

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

	$effect(() => {
		if (value === null || value === undefined) return;

		const raw = value.toString();
		const sanitized = raw.replace(/[^\d,]/g, '');
		if (sanitized !== raw) value = sanitized;

		const clean = sanitized.replace(/,/g, '');
		if (clean === '' || Number.isNaN(Number(clean))) return;
		const formatted = Number(clean).toLocaleString();
		if (formatted !== sanitized) value = formatted;
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
	<InputGroup.Root>
		<InputGroup.Input
			aria-invalid={!!(issues?.length && issues.length > 0)}
			inputmode="numeric"
			pattern="[0-9,]*"
			bind:value
			{...props}
		/>
		<InputGroup.Addon align="inline-end">Cr</InputGroup.Addon>
	</InputGroup.Root>
	<FieldError hidden={!_issues?.length} class={STYLES.input.error}>{_issues.join(', ')}</FieldError>
	<FieldDescription hidden={!description && !descriptionSnippet} class={STYLES.input.description}
		>{description}
		{@render descriptionSnippet?.()}
	</FieldDescription>
</Field>

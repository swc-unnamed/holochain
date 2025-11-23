<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { cn } from '$lib/utils';
	import { STYLES } from '../styles';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CheckboxInputProps } from './checkbox-input.types';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		issues = $bindable(),
		checked = $bindable(false),
		...props
	}: CheckboxInputProps = $props();

	let _issues = $derived.by(() => {
		if (Array.isArray(issues)) {
			return issues.map((e) => e.message);
		} else if (typeof issues === 'string' && issues.length > 0) {
			return [issues];
		}
		return [];
	});

	let id = $derived(props.id ?? props.name);
</script>

<Field class={STYLES.checkboxOrToggle.field}>
	<div>
		<div class="flex items-center gap-4">
			<Checkbox bind:checked class={cn(STYLES.checkboxOrToggle.checkbox, props.class)} />
			<div>
				<FieldLabel class={STYLES.input.label} hidden={!label && !labelSnippet} for={id}
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

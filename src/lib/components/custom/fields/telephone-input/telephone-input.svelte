<script lang="ts">
	import {
		Field,
		FieldLabel,
		FieldError,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input';
	import { STYLES } from '../styles';
	import type { TelephoneInputProps } from './telephone-input.types';

	let {
		label,
		labelSnippet,
		descriptionSnippet,
		description,
		issues = $bindable(),
		value = $bindable(),
		...props
	}: TelephoneInputProps = $props();

	let _issues = $derived.by(() => {
		if (Array.isArray(issues)) {
			return issues.map((e) => e.message);
		} else if (typeof issues === 'string' && issues.length > 0) {
			return [issues];
		}
		return [];
	});

	let countryCode = $derived(props.countryCode ?? '+1');

	$effect(() => {
		if (!value) return;
		let digits = (value ?? '').toString().replace(/\D/g, '');

		const codeDigits = countryCode.replace(/\D/g, '');
		if (!digits.startsWith(codeDigits)) {
			digits = codeDigits + digits;
		}

		const local = digits.slice(codeDigits.length, codeDigits.length + 10);
		const normalized = codeDigits + local;

		const next = '+' + normalized;
		if (value !== next) value = next;
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
		<Input bind:value inputmode="numeric" pattern="[0-9+]*" {...props} />
	</FieldLabel>

	<FieldError hidden={!_issues?.length} class={STYLES.input.error}>{_issues.join(', ')}</FieldError>
	<FieldDescription hidden={!description && !descriptionSnippet} class={STYLES.input.description}
		>{description}
		{@render descriptionSnippet?.()}
	</FieldDescription>
</Field>

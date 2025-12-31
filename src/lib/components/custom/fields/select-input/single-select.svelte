<script lang="ts">
	import type { SelectInputProps } from './select-input.types';
	import * as Select from '$lib/components/ui/select/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { cn } from '$lib/utils';

	let {
		onValueChange,
		value = $bindable(),
		...props
	}: Omit<SelectInputProps, 'value'> & { value: string } = $props();

	let searchValue = $state('');
	let actualOptions = $state<any[]>(props.records);
	let placeholder = $state(props.placeholder ?? 'Please select an option');
	// let placeholder = $derived.by(() => {
	//   if (!value) return props.placeholder ?? 'Please select an option';
	//   if (value)
	//     return (
	//       props.records?.find((r) => r[props.valueKey] === value)?.[props.labelKey] ??
	//       props.placeholder ??
	//       'Please select an option'
	//     );
	// });

	$effect(() => {
		const labelKey = props.labelKey;
		const valueKey = props.valueKey;
		const records = props.records ?? [];

		if (value == null || value === '') {
			placeholder = props.placeholder ?? 'Please select an option';
		} else {
			const record = records.find((r) => r[valueKey] === value);
			placeholder = record ? record[labelKey] : (props.placeholder ?? 'Please select an option');
		}

		if (!records.length) {
			actualOptions = [];
			return;
		}

		const lowerSearch = props.searchable && searchValue ? searchValue.toLowerCase() : null;

		const validRecords = records.filter((r) => {
			const label = r?.[labelKey];
			const val = r?.[valueKey];
			return label && val != null && label !== '';
		});

		const selectedRecord = validRecords.find((r) => r[valueKey] === value);
		const matching: any[] = [];

		for (const record of validRecords) {
			const label = String(record[labelKey]);
			if (record === selectedRecord) continue;
			if (!lowerSearch || label.toLowerCase().includes(lowerSearch)) {
				matching.push(record);
			}
		}

		const sorter = (a: any, b: any) => String(a[labelKey]).localeCompare(String(b[labelKey]));

		if (matching.length > 1) matching.sort(sorter);

		actualOptions = selectedRecord ? [selectedRecord, ...matching] : matching;
	});
</script>

{#if actualOptions && props.type === 'single'}
	<Select.Root
		bind:value={value as string}
		allowDeselect={props.allowDeselect}
		disabled={props.disabled}
		onValueChange={async (v: string) => {
			onValueChange?.(v as string & string[]);
		}}
		type="single"
	>
		<Select.Trigger class="w-full truncate">{placeholder}</Select.Trigger>
		<Select.Content>
			{#if props.searchable}
				<Input class="my-2" bind:value={searchValue} placeholder="Search..." />
			{/if}
			{#each actualOptions as record (record[props.valueKey])}
				{@const isSelected = Array.isArray(value)
					? value.includes(record[props.valueKey])
					: value === record[props.valueKey]}
				<Select.Item
					class={cn('mb-1 cursor-pointer', isSelected && 'border bg-muted')}
					value={record[props.valueKey]}
				>
					{record[props.labelKey]}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/if}

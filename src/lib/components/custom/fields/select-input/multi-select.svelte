<script lang="ts">
  import type { SelectInputProps } from './select-input.types';
  import * as Select from '$lib/components/ui/select/index.js';
  import Input from '$lib/components/ui/input/input.svelte';
  import { cn } from '$lib/utils';

  let { onValueChange, value = $bindable(), ...props }: SelectInputProps = $props();

  let searchValue = $state('');

  let actualOptions = $derived.by(() => {
    if (!props.records || props.records.length === 0) return [];
    if (!searchValue || !props.searchable) return props.records;
    const labelKey = props.labelKey;
    const records = props.records ?? [];
    if (!records.length) return [];
    const validRecords = records.filter((r) => {
      const val = r?.[labelKey];
      return val;
    });
    return validRecords;
  });

  let placeholder = $derived.by(() => {
    if (!searchValue || !props.searchable) return props.placeholder ?? 'Please select an option';
    if (!props.records || props.records.length === 0)
      return props.placeholder ?? 'Please select an option';
    const labelKey = props.labelKey;
    const valueKey = props.valueKey;
    const records = props.records ?? [];

    if (!value || value.length === 0) {
      return props.placeholder ?? 'Please select an option';
    } else {
      const selectedLabels = records
        .filter((r) => value?.includes(r[valueKey]))
        .map((r) => r[labelKey]);
      return selectedLabels.length > 0
        ? selectedLabels.join(', ')
        : (props.placeholder ?? 'Please select an option');
    }
  });
</script>

{#if actualOptions && props.type === 'multiple'}
  <Select.Root
    bind:value={value as string[]}
    onValueChange={async (v) => {
      onValueChange?.(v as string & string[]);
    }}
    type="multiple"
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
          class={cn('mb-1 cursor-pointer', isSelected && 'bg-muted border')}
          value={record[props.valueKey]}
        >
          {record[props.labelKey]}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
{/if}

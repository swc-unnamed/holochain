/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RemoteFormIssue } from '@sveltejs/kit';
import type { Snippet } from 'svelte';
import type { ComponentProps } from 'svelte';
import type { Select } from '$lib/components/ui/select';
type BaseProps = {
  searchable?: boolean;
  asObject?: boolean;
  allowDeselect?: boolean;
  records: Array<Record<string | number, any>>;
  labelKey: string;
  valueKey: string;
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  descriptionSnippet?: Snippet;
  issues?: string | RemoteFormIssue[];
  placeholder?: string;
} & Omit<ComponentProps<typeof Select>, 'value' | 'onValueChange' | 'type'>;

// Discriminated union: the `type` key is literal and locked
export type SingleSelectProps = BaseProps & {
  readonly type: 'single';
  value?: string | null;
  onValueChange?: (value: string | null) => void;
};

export type MultiSelectProps = BaseProps & {
  readonly type: 'multiple';
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

export type SelectInputProps = SingleSelectProps | MultiSelectProps;

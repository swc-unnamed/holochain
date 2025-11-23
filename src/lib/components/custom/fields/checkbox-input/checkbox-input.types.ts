import type { RemoteFormIssue } from '@sveltejs/kit';
import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
import type { ComponentProps, Snippet } from 'svelte';

type Props = {
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  descriptionSnippet?: Snippet;
  checked?: boolean;
  issues?: string | RemoteFormIssue[];
  isRequired?: boolean;
} & Omit<ComponentProps<typeof Checkbox>, 'type'>;

export type { Props as CheckboxInputProps };

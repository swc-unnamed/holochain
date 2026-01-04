import type { Input } from '$lib/components/ui/input';
import type { RemoteFormIssue } from '@sveltejs/kit';
import type { ComponentProps, Snippet } from 'svelte';

type Props = {
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  descriptionSnippet?: Snippet;
  issues?: string | RemoteFormIssue[];
} & ComponentProps<typeof Input>;

export type { Props as FieldInputProps };

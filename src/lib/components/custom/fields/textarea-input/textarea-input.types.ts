import type { Textarea } from '$lib/components/ui/textarea';
import type { RemoteFormIssue } from '@sveltejs/kit';
import type { ComponentProps, Snippet } from 'svelte';

type Props = {
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  fieldClass?: string;
  descriptionSnippet?: Snippet;
  issues?: string | RemoteFormIssue[];
} & ComponentProps<typeof Textarea>;

export type { Props as TextareaInputProps };

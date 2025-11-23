import type { Input } from '$lib/components/ui/input';
import type { RemoteFormIssue } from '@sveltejs/kit';
import type { ComponentProps, Snippet } from 'svelte';

type Props = {
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  descriptionSnippet?: Snippet;
  type: 'file';
  issues?: string | RemoteFormIssue[];
  files?: FileList;
} & Omit<ComponentProps<typeof Input>, 'files' | 'file'>;

export type { Props as FileInputProps };

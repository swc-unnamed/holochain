import type { RemoteFormIssue } from '@sveltejs/kit';
import type Switch from '$lib/components/ui/switch/switch.svelte';
import type { ComponentProps, Snippet } from 'svelte';

type Props = {
  label?: string;
  labelSnippet?: Snippet;
  description?: string;
  descriptionSnippet?: Snippet;
  checked?: boolean;
  issues?: string | RemoteFormIssue[];
} & Omit<ComponentProps<typeof Switch>, 'type'>;

export type { Props as SwitchInputProps };

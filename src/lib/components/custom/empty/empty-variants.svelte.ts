
import CloudAlert from '@lucide/svelte/icons/cloud-alert';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';
import ErrorContent from './content/error-content.svelte';
import type { EmptyVariants } from './empty.types';
import { MousePointer2 } from '@lucide/svelte';

const variants: EmptyVariants = {
  default: {
    icon: MousePointer2,
    title: "Nothing Here",
    description: 'There is currently no content to display.',
    containerClass: 'border'
  },
  error: {
    icon: CloudAlert,
    title: 'Oops! Something went wrong!',
    description:
      'An unexpected error occurred. Try reloading the page, or if it persists contact the TSC.',
    containerClass: 'bg-destructive/10 border border-destructive/50',
    iconClass: 'text-destructive',
    content: ErrorContent
  },
  loading: {
    icon: LoaderCircle,
    title: 'Loading Content',
    description: 'Please wait...',
    containerClass: 'border',
    iconClass: 'animate-spin text-primary'
  }
};

export { variants };
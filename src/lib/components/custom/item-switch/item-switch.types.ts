import type { ItemVariant } from "$lib/components/ui/item/item.svelte";
import type { Switch } from "$lib/components/ui/switch";
import type { ComponentProps } from "svelte";

export type ItemSwitchProps = {
  label: string;
  variant?: ItemVariant;
  description?: string;
  checked?: boolean;
} & Omit<ComponentProps<typeof Switch>, 'type'>;
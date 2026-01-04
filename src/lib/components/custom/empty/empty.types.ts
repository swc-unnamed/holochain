import type { Component, Snippet } from 'svelte';
import { variants } from './empty-variants.svelte';

/**
 * Represents a single icon variant used by the Empty state component.
 */
export interface EmptyVariant {
  /**
   * The Lucide Svelte icon component that visually represents the state.
   * This should be imported from `@lucide/svelte`.
   *
   * @example
   * ```ts
   * import { CloudAlert } from '@lucide/svelte';
   * icon: CloudAlert
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;

  /**
   * The title text displayed as the main heading for this variant.
   * Should be concise and clearly communicate the state.
   *
   * @example "There's nothing here"
   */
  title: string;

  /**
   * A short descriptive message that provides additional context.
   * Used below the title to explain what happened or what the user should do.
   *
   * @example "We were unable to find what you were looking for."
   */
  description: string;

  /**
   * CSS utility classes (e.g., Tailwind) applied to the variant’s
   * outer container to modify its background, border, or spacing.
   *
   * @example "bg-destructive/10 border border-destructive/50"
   */
  containerClass: string;

  /**
   * Optional CSS classes applied directly to the icon itself.
   * Useful for customizing size, color, or alignment.
   *
   * @example "text-muted-foreground h-8 w-8"
   */
  iconClass?: string;

  /**
   * Displayed below the empty description
   * Useful for actions that would help the user recover from the empty state.
   *
   * @example
   * ```svelte
   * {#snippet content()}
   *    <Button onclick={window.location.reload()}>Reload</Button>
   * {/snippet}
   * ```
   */
  content?: Component;
}

/**
 * Defines the fixed set of valid Empty state variants.
 *
 * Each key corresponds to a specific visual state of the component:
 * - `'default'` → shown when there is no content
 * - `'error'` → displayed when something went wrong
 * - `'loading'` → shown while content is being fetched or processed
 */
export type EmptyVariants = {
  [K in 'default' | 'error' | 'loading']: EmptyVariant;
};

/**
 * Props accepted by the Empty state component.
 */
export type EmptyProps = {
  /**
   * Which visual variant to display.
   * Must be one of the keys defined in {@link IconVariants}.
   *
   * @default 'default'
   */
  variant?: keyof typeof variants;

  /**
   * A Svelte `Snippet` representing the content area of the Empty component.
   * Typically contains custom UI such as buttons or links.
   */
  content?: Snippet;

  /**
   * Optional custom title text that overrides the variant’s default title.
   */
  title?: string;

  /**
   * Optional custom description that overrides the variant’s default description.
   */
  description?: string;

  /**
   * A custom Lucide Svelte icon component to render instead of the variant’s default icon.
   *
   * @remarks
   * Must be a component imported from `@lucide/svelte`.
   *
   * @example
   * ```svelte
   * <Empty Icon={Bell} />
   * ```
   */
  Icon?: Component;

  /**
   * Optional custom `Snippet` used to render a fully custom icon block
   * instead of using the default or provided Lucide component.
   */
  iconSnippet?: Snippet;
};
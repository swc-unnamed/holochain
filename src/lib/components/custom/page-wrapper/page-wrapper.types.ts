import type { Snippet } from "svelte";

export type PageWrapperProps = {
  header?: Snippet;
  title?: string;
  children: Snippet;
}
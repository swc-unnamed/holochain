import { browser } from "$app/environment"
import { page } from "$app/state"

export const hasRole = (role: string): boolean => {
  if (!browser) return false

  return true;
}
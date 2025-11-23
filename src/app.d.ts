import type { UserPreference } from "$lib/generated/prisma/browser";
import type { AppRole } from "$lib/generated/prisma/enums";

declare global {

  interface RemoteFunctionIssue {
    readonly message: string;
  }

  interface User {
    id: string;
    name: string;
    displayName: string;
    role: AppRole;
    avatarUrl?: string;
    combineId?: string;
    combineScopes?: string[];
    discordId?: string;
    discordUsername?: string;
    preferences: UserPreference[];
    anonid: string;
  }

  namespace App {
    interface Error {
      message: string;
      issues?: Record<string, RemoteFunctionIssue>;
    }
    interface Locals {
      user: User;
    }
    interface PageData {
      user: User;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export { };

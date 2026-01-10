import type { UserPreference } from "$lib/generated/prisma/browser";
import type { ApiClientScope, AppRole } from "$lib/generated/prisma/enums";

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
    ctr: number;
  }

  interface ApiClient {
    id: string;
    scopes: ApiClientScope[];
  }

  namespace App {
    interface Error {
      message: string;
      issues?: Record<string, RemoteFunctionIssue>;
    }
    interface Locals {
      user: User;
      apiClient?: ApiClient;
    }
    interface PageData {
      user: User;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export { };

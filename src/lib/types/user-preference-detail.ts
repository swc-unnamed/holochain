import { UserPreferenceKey } from "$lib/generated/prisma/enums";

interface UserPreferenceDetail {
  key: UserPreferenceKey;
  name: string;
  description: string;
  default: string;
}

export const UserPreferences: Record<UserPreferenceKey, UserPreferenceDetail> = {
  GLOBAL_THEME_MODE: {
    key: 'GLOBAL_THEME_MODE',
    name: 'Global - Theme Mode',
    description: 'Set the global theme mode. Can be light, dark, or system to follow your device settings.',
    default: 'system'
  },
  GLOBAL_ENABLE_NOTIFICATIONS: {
    key: 'GLOBAL_ENABLE_NOTIFICATIONS',
    name: 'Global - Enable Notifications',
    description: 'Enable or disable notifications from the application. This affects all notification types.',
    default: 'true'
  },
  GLOBAL_ANONYMOUS_MODE: {
    key: 'GLOBAL_ANONYMOUS_MODE',
    name: 'Global - Anonymous Mode',
    description: 'When enabled, your actions will not be associated with your name publicly. You can still interact normally, but your identity will be hidden.',
    default: 'false'
  }
}

export function getDefaultPreferences(): Record<UserPreferenceKey, string> {
  const defaults: Record<UserPreferenceKey, string> = {} as Record<UserPreferenceKey, string>;
  for (const key in UserPreferences) {
    const prefKey = key as UserPreferenceKey;
    defaults[prefKey] = UserPreferences[prefKey].default;
  }
  return defaults;
}
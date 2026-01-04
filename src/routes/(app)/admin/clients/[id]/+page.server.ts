import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals, params }) => {
  guard(locals, ['DEVELOPER']);

  return {
    id: params.id
  }
}
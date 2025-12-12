import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals, params, depends }) => {
  guard(locals, ['AUCTIONEER']);

  depends('auction:manage');

  return {
    auctionId: params.id
  }
}
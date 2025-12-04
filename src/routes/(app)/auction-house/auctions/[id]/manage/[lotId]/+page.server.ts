import { guard } from '$lib/utils/auth/server-guard.js'

export const load = async ({ locals, params }) => {
  guard(locals, ['AUCTIONEER']);

  return {
    auctionId: params.id,
    lotId: params.lotId,
  }
}
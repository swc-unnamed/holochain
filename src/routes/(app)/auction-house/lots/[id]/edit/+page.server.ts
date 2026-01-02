import { guard } from '$lib/utils/auth/server-guard.js';

export const load = async ({ params, locals, depends }) => {
  depends('auction-house:lot:edit');
  guard(locals, ['AUCTIONEER']);

  return {
    id: params.id
  }
}
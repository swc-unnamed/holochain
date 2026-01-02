import { guard } from '$lib/utils/auth/server-guard.js';

export const load = async ({ params, locals, depends }) => {
  depends('ah:lot:edit');
  guard(locals, ['AUCTIONEER']);

  return {
    id: params.id
  }
}
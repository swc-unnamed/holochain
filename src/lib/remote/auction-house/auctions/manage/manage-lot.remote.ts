import { command, getRequestEvent } from "$app/server";
import { guard } from "$lib/utils/auth/server-guard";
import { manageLotSchema } from "./manage-lot.schema";

export const manageLot = command(manageLotSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);

  console.log('Managing lot with data:', data);
})
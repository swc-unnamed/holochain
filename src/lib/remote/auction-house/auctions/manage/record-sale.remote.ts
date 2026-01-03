import { command, getRequestEvent } from "$app/server";
import { guard } from "$lib/utils/auth/server-guard";
import { parseCurrency } from "$lib/utils/helpers/shared/currency";
import { error } from "@sveltejs/kit";
import { recordSaleSchema } from "./record-sale.schema";
import { db } from "$lib/db/prisma";
import { inngest } from "$lib/inngest";

export const recordSale = command(recordSaleSchema, async (data) => {
  console.log("Record Sale Data:", data);
  const { locals } = getRequestEvent();
  guard(locals, ['AUCTIONEER']);


  const parsedCurrency = parseCurrency(data.winningAmount);

  if (isNaN(Number(parsedCurrency))) {
    throw error(400, {
      message: "Invalid Winning Amount"
    })
  }

  await db.lot.update({
    where: {
      id: data.lotId
    },
    data: {
      status: 'SOLD',
      purchasePrice: parsedCurrency,
      purchasedById: data.winnerId || null,
      purchasedByMiddle: data.purchasedViaMiddle,
      middleId: data.middleId,
      history: {
        create: {
          event: `Lot marked as sold by ${locals.user.displayName} for ${data.winningAmount} credits.`,
        }
      }
    }
  });

  await inngest.send({
    name: 'auction-house/lot.record-sale',
    data: {
      id: data.lotId
    }
  })
  return { success: true };
})
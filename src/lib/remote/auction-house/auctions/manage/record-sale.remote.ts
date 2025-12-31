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
      history: {
        create: {
          event: `Lot marked as sold by ${locals.user.displayName} for ${data.winningAmount} credits.`,
        }
      }
    }
  });

  if (data.winnerMiddleId) {
    const middle = await db.user.findUniqueOrThrow({
      where: {
        id: data.winnerMiddleId
      },
      select: {
        id: true,
        displayName: true,
      }
    });

    await db.lotHistory.create({
      data: {
        lotId: data.lotId,
        event: `Middleman ${middle.displayName} assigned to this sale.`,
      }
    })
  }

  await inngest.send({
    name: 'auction-house/broadcast.record-lot-sale',
    data: {
      id: data.lotId
    }
  })
  return { success: true };
})
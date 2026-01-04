import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { parseCurrency } from "$lib/utils/helpers/shared/currency";

export const getCurrentUserLotStats = query(async () => {
  const { locals } = getRequestEvent();

  const lotsByStatus = await db.lot.groupBy({
    where: {
      createdById: locals.user.id
    },
    by: ['status'],
    _count: {
      id: true
    }
  });

  const lotsPurchased = await db.lot.findMany({
    where: {
      purchasedById: locals.user.id
    },
    select: {
      purchasePrice: true
    }
  });

  const lotsSold = await db.lot.findMany({
    where: {
      createdById: locals.user.id
    },
    select: {
      purchasePrice: true
    }
  });

  let purchasedTotal = 0;
  let soldTotal = 0;

  for (const lot of lotsPurchased) {
    if (lot.purchasePrice) {
      const price = Number(parseCurrency(lot.purchasePrice));
      if (!isNaN(price)) {
        purchasedTotal += price;
      }
    }
  }

  for (const lot of lotsSold) {
    if (lot.purchasePrice) {
      const price = Number(parseCurrency(lot.purchasePrice));
      if (!isNaN(price)) {
        soldTotal += price;
      }
    }
  }

  return {
    lotsByStatus: lotsByStatus,
    purchasedTotal: purchasedTotal,
    soldTotal: soldTotal
  }
})
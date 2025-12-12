import { createAuctionSchema } from "./create-auction.schema";
import { command } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";

export const createAuction = command(createAuctionSchema, async (data) => {
  console.log("Creating auction with data:", data);

  const lots = await db.lot.findMany({
    where: {
      id: {
        in: data.lots,
      }
    }
  });

  // make sure all items exist
  if (lots.length !== data.lots.length) {
    throw error(400, {
      message: 'One or more items do not exist.'
    })
  }

  const toUTCDate = (value?: string | null) => {
    if (!value) return undefined;
    const local = new Date(value);
    return new Date(local.getTime() - local.getTimezoneOffset() * 60_000);
  };

  const auction = await db.auction.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      start: toUTCDate(data.start),
      end: toUTCDate(data.end),
    }
  });

  await db.lot.updateMany({
    where: {
      id: {
        in: data.lots
      }
    },
    data: {
      auctionId: auction.id,
      status: 'SCHEDULED',
    }
  });

  return {
    id: auction.id
  }
})
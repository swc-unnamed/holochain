import { createAuctionSchema } from "./create-auction.schema";
import { command } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";

export const createAuction = command(createAuctionSchema, async (data) => {
  console.log("Creating auction with data:", data);

  const items = await db.lotItem.findMany({
    where: {
      id: {
        in: data.items,
      }
    }
  });

  // make sure all items exist
  if (items.length !== data.items.length) {
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
        in: data.items
      }
    },
    data: {
      auctionId: auction.id,
      status: 'SCHEDULED',
    }
  });

  // todo: emit a task for the auction

  return {
    id: auction.id
  }
})
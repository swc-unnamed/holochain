import { command, getRequestEvent } from "$app/server";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { updateAuctionSchema } from "./update-auction.schema";
import { db } from "$lib/db/prisma";

export const updateAuction = command(updateAuctionSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ["AUCTIONEER"]);

  try {
    await db.auction.update({
      where: {
        id: data.id
      },
      data: {
        title: data.title,
        description: data.description,
        start: data.start ? new Date(data.start) : null,
        end: data.end ? new Date(data.end) : null,
        status: data.status
      }
    });

    return { success: true };
  } catch (err) {
    console.error('Error updating auction:', err);
    throw error(400, {
      message: 'Failed to update auction. Please try again later.'
    })
  }
})
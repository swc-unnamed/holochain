import { command, getRequestEvent } from "$app/server";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { updateAuctionSchema, updateAuctionStatusSchema } from "./update-auction.schema";
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
      }
    });

    return { success: true };
  } catch (err) {
    console.error('Error updating auction:', err);
    throw error(400, {
      message: 'Failed to update auction. Please try again later.'
    })
  }
});

export const updateAuctionStatus = command(updateAuctionStatusSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ["AUCTIONEER"]);

  const auction = await db.auction.findUniqueOrThrow({
    where: {
      id: data.id
    },
    include: {
      lots: true
    }
  });

  if (data.status === 'CANCELLED') {
    // All lots in the auction that have not been listed as SOLD should be moved back to SUBMITTED
    const lotIds = auction.lots.filter(lot => lot.status === 'SCHEDULED').map(lot => lot.id);

    await db.$transaction(async (tx) => {
      await tx.lot.updateMany({
        where: {
          auctionId: data.id,
          id: {
            in: lotIds
          }
        },
        data: {
          status: 'SUBMITTED',
          auctionId: null,
        }
      });

      await tx.lotHistory.createMany({
        data: lotIds.map(lotId => ({
          lotId: lotId,
          event: 'Assigned Auction was cancelled, lot has been moved back to a Submitted status',
        }))
      });

      await tx.auction.update({
        where: {
          id: data.id
        },
        data: {
          status: data.status
        }
      })
    });

    return { success: true };
  }

  if (data.status === 'COMPLETED') {
    // Ensure all lots are in SOLD status before completing the auction

    const unsoldLots = auction.lots.filter(lot => lot.status !== 'SOLD');
    if (unsoldLots.length > 0) {
      throw error(400, {
        message: 'Cannot complete auction with unsold lots.'
      });
    }

    await db.auction.update({
      where: {
        id: data.id
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })
  }

  await db.auction.update({
    where: {
      id: data.id
    },
    data: {
      status: data.status
    }
  })

})
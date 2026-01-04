import { query } from "$app/server";
import { db } from "$lib/db/prisma";
import { error } from "@sveltejs/kit";
import { getLotDetailSchema } from "./get-lot-detail.schema";

export const getLotDetail = query(getLotDetailSchema, async (data) => {
  const selectedLot = await db.lot.findUnique({
    where: { id: data.lotId },
    include: {
      createdBy: {
        select: {
          id: true,
          displayName: true,
          ctr: true,
          anonid: true
        }
      },
      items: {
        include: {
          asset: true
        }
      }
    }
  });

  if (!selectedLot) {
    throw error(404, {
      message: `Lot with ID ${data.lotId} not found`
    })
  }

  if (!selectedLot.anonLot) {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdBy, ...lotWithoutCreator } = selectedLot;

    const sanitizedCreator = selectedLot.createdBy ? {
      displayName: selectedLot.createdBy.displayName,
      id: selectedLot.createdBy.id,
      karma: selectedLot.createdBy.ctr,
    } : {}

    return {
      ...lotWithoutCreator,
      createdBy: sanitizedCreator,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdById, ...lotWithoutCreatorId } = selectedLot;

  const sanitizedCreator = selectedLot.createdBy
    ? {
      displayName: selectedLot.createdBy.anonid,
      id: null,
    }
    : undefined;

  return {
    ...lotWithoutCreatorId,
    createdBy: sanitizedCreator,
  };
})
import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";

export const createDraftLot = command(async () => {
  const { locals } = getRequestEvent();

  const draftCount = await db.lot.count({
    where: {
      createdById: locals.user.id,
      status: 'DRAFT',
      type: 'LOT'
    }
  });

  if (draftCount >= 5) {
    return {
      id: null,
      success: false,
      message: 'You have reached the maximum number of draft lots (5).'
    }
  }

  const lot = await db.lot.create({
    data: {
      status: 'DRAFT',
      createdById: locals.user.id,
      type: 'LOT',
      title: 'Draft Lot',
      details: '',
      location: '',
      startPrice: '100,000',
      anonLot: false,
    }
  });

  return {
    id: lot.id,
    success: true,
    message: 'Draft lot created successfully.'
  }
})
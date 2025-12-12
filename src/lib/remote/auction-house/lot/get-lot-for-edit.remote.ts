import { query, getRequestEvent } from "$app/server";
import { db } from "$lib/db/prisma";
import { getLotForEditSchema } from "./get-lot-for-edit.schema";
import { error } from '@sveltejs/kit';

export const getLotForEdit = query(getLotForEditSchema, async ({ lotId }) => {
  const { locals } = getRequestEvent();

  const lot = await db.lot.findUnique({
    where: {
      id: lotId,
    },
    include: {
      items: {
        include: {
          entity: {
            select: {
              id: true,
              name: true,
              type: true,
              imageSmall: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }
    },
  });

  if (!lot) {
    error(404, {
      message: `Lot with ID ${lotId} not found`,
    })
  }

  // Check authorization: must be creator OR have DEVELOPER/TZAR role
  const isCreator = lot.createdById === locals.user.id;
  const isAdmin = locals.user.role === 'DEVELOPER' || locals.user.role === 'TZAR';

  if (!isCreator && !isAdmin) {
    error(403, {
      message: 'You do not have permission to edit this lot'
    });
  }

  return lot;
});

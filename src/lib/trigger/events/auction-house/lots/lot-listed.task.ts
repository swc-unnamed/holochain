import { db } from '$lib/db/prisma';
import { logger, task } from '@trigger.dev/sdk/v3';

export const newLotTask = task({
  id: 'lot-listed-task',
  maxDuration: 60, // 1 minute
  run: async (payload: { lotId: string; }) => {
    logger.log('executing new lot task');

    const { lotId } = payload;

    const lot = await db.lot.findUnique({
      where: { id: lotId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            anonid: true,
            avatarUrl: true
          }
        },
        items: {
          include: {
            entity: {
              omit: {
                combineData: true
              }
            }
          }
        }
      }
    });

    if (!lot) {
      logger.error('Lot not found', { lotId });
      throw new Error(`Lot with ID ${lotId} not found`);
    }

    logger.info('New lot created', { lotId, lot });

    const publishPayload = {
      id: lot.id,
      lotNumber: lot.lotNumber,
      title: lot.title,
      details: lot.details,
      location: lot.location,
      listedBy: lot.anonLot ? lot.createdBy?.anonid : lot.createdBy?.name,
      starPrice: lot.startPrice,
      items: lot.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        uuu: item.uuu,
        batch: item.batch,
        custom: item.custom,
        note: item.notes,
        entity: {
          id: item.entity.id,
          name: item.entity.name,
          type: item.entity.type,
          combineUid: item.entity.combineUid,
          combineHref: item.entity.combineHref,
          images: {
            small: item.entity.imageSmall,
            large: item.entity.imageLarge,
          }
        }
      }))
    }

    logger.info(`Broadcased lot payload: `, publishPayload);

    return { message: 'New lot task processed' };
  }
})
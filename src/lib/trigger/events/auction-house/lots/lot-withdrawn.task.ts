import { db } from '$lib/db/prisma';
import { logger, task } from '@trigger.dev/sdk/v3';

export const withdrawLotTask = task({
  id: 'lot-withdrawn-task',
  maxDuration: 60, // 1 minute
  run: async (payload: { lotId: string; userId: string; }) => {
    const { lotId, userId } = payload;

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
      }
    });

    if (!lot) {
      logger.error('Lot not found', { lotId });
      throw new Error(`Lot with ID ${lotId} not found`);
    }

    const publishPayload = {
      id: lot.id,
      lotNumber: lot.lotNumber,
      withdrawnBy: lot.anonLot ? lot.createdBy?.anonid : lot.createdBy?.name,
    }

    if (userId !== lot.createdById) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
        }
      });

      publishPayload.withdrawnBy = user?.name || 'Unknown User';
    }

    logger.info(`Broadcased lot payload: `, publishPayload);

    return { message: 'Withdrawn lot task processed' };
  }
})
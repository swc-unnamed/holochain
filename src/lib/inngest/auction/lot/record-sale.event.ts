import { db } from "$lib/db/prisma";
import { getCtrConfig } from "$lib/db/shared/get-ctr-config";
import { inngest } from "$lib/inngest/client";

export type AuctionLotRecordSaleEvent = {
  id: string;
  txHash: string;
}

export const lotRecordSaleEvent = inngest.createFunction(
  {
    id: 'auction-house-lot-record-sale',
    retries: 3,
    timeouts: {
      finish: '60s'
    }
  },
  {
    event: 'auction-house/lot.record-sale',
  },
  async ({ event, step, logger }) => {

    logger.info('Processing auction lot record sale event');
    const lot = await step.run('fetch lot', async () => {
      return await db.lot.findUniqueOrThrow({
        where: {
          id: event.data.id
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              discordId: true,
              preferences: {
                where: {
                  key: 'GLOBAL_ENABLE_NOTIFICATIONS'
                }
              }
            }
          },
          purchasedBy: {
            select: {
              id: true,
              displayName: true,
              discordId: true,
              preferences: {
                where: {
                  key: 'GLOBAL_ENABLE_NOTIFICATIONS'
                }
              }
            }
          }
        }
      });
    });

    logger.info(`Recording sale for lot ${lot.id} (${lot.lotNumber})`);

    const lotPurchasedCtr = await getCtrConfig('AH_LOT_PURCHASED');
    const lotSoldCtr = await getCtrConfig('AH_LOT_SOLD');

    logger.debug('sending broadcast event for lot sale');
    await inngest.send({
      name: 'auction-house/broadcast.record-lot-sale',
      data: {
        id: lot.id,
        middleId: lot.middleId ?? undefined,
        txHash: event.data.txHash
      }
    });

    logger.debug('sent')

    if (lot.createdBy?.preferences.find(p => p.key === 'GLOBAL_ENABLE_NOTIFICATIONS')?.value === 'true') {
      // send notification to creator
    }

    if (lot.purchasedBy?.preferences.find(p => p.key === 'GLOBAL_ENABLE_NOTIFICATIONS')?.value === 'true') {
      // send notification to purchaser, if there is one
    }

    // Update CTRs

    //- If there is a purchaser, give them CTR for purchasing
    if (lot.purchasedById) {
      if (lotPurchasedCtr && lotPurchasedCtr.points !== 0) {
        const reason = `Purchased Lot ${lot.lotNumber} ${lotPurchasedCtr.reason ? `- ${lotPurchasedCtr.reason}` : ''}`;

        await db.user.update({
          where: {
            id: lot.purchasedById
          },
          data: {
            ctr: { increment: lotPurchasedCtr.points }
          }
        })

        await db.chainTrustRatingLog.create({
          data: {
            userId: lot.purchasedById,
            delta: lotPurchasedCtr.points,
            reason: reason,
            event: 'AH_LOT_PURCHASED'
          }
        })
      }
    }

    //- Give CTR to creator for selling
    if (lotSoldCtr && lotSoldCtr.points !== 0) {
      const reason = `Sold Lot ${lot.lotNumber} - ${lotSoldCtr.reason ? `- ${lotSoldCtr.reason}` : ''}`;

      await db.user.update({
        where: {
          id: lot.createdById
        },
        data: {
          ctr: { increment: lotSoldCtr.points }
        }
      })

      await db.chainTrustRatingLog.create({
        data: {
          userId: lot.createdById,
          delta: lotSoldCtr.points,
          reason: reason,
          event: 'AH_LOT_SOLD'
        }
      })
    }

    //- If there is a middle, give them CTR for brokering
    if (lot.middleId) {
      const middle = await db.user.findUnique({
        where: {
          id: lot.middleId
        }
      });

      if (middle) {
        const lotBrokeredCtr = await getCtrConfig('AH_LOT_BROKERED_SALE')
        if (lotBrokeredCtr && lotBrokeredCtr.points !== 0) {
          const reason = `Brokered Sale of Lot ${lot.lotNumber} - ${lotBrokeredCtr.reason ? `- ${lotBrokeredCtr.reason}` : ''}`;

          await db.user.update({
            where: {
              id: lot.middleId
            },
            data: {
              ctr: { increment: lotBrokeredCtr.points }
            }
          })

          await db.chainTrustRatingLog.create({
            data: {
              userId: lot.middleId,
              delta: lotBrokeredCtr.points,
              reason: reason,
              event: 'AH_LOT_BROKERED_SALE'
            }
          })
        }
      }
    }
  }
)
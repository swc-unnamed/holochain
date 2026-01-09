import { db } from "$lib/db/prisma";
import { inngest } from "../client";

export type UpdateLotTxEventParams = {
  txHash: string;
  combineCreditLogId: string;
}

export const updateLotTxEvent = inngest.createFunction(
  {
    id: 'lot-tx-update-event',
    retries: 3,
    timeouts: {
      finish: '60s'
    }
  },
  {
    event: 'automation/lot-tx.update'
  },
  async ({ event, logger, step }) => {
    logger.info("lot TX update event triggered", { event });

    const { txHash, combineCreditLogId } = event.data as UpdateLotTxEventParams;

    const lotTx = await step.run("fetch lot tx", async () => {
      return await db.lotTransaction.findUniqueOrThrow({
        where: {
          txHash: txHash
        },
        include: {
          lot: true
        }
      })
    });

    const isCompleted = await step.run('verify lot tx not already completed', async () => {
      if (lotTx.completed) {
        logger.info("Lot transaction already completed, skipping automation", {
          lotTxId: lotTx.id
        });

        return true;
      }
    });

    // Return early if already completed
    if (isCompleted) return;

    const combineCreditLog = await step.run("fetch combine credit log", async () => {
      return await db.combineCreditLog.findUniqueOrThrow({
        where: {
          id: combineCreditLogId
        }
      })
    });

    await step.run("verify amount on chain", async () => {
      const loggedAmount = combineCreditLog.amount;
      const lotTxAmount = lotTx.amount;

      if (loggedAmount !== lotTxAmount) {
        logger.error("Amount mismatch between credit log and lot transaction", {
          loggedAmount,
          lotTxAmount: lotTx.amount
        });

        await db.lotTransaction.update({
          where: {
            id: lotTx.id
          },
          data: {
            completed: false,
            completedAt: new Date(),
            lot: {
              update: {
                status: 'SOLD',
                history: {
                  create: {
                    event: `[CHAIN] Amount mismatch for transaction. Unable to continue with automation`,
                  }
                }
              }
            }
          }
        });

        throw new Error("Amount mismatch between credit log and lot transaction");
      }
    })

    // Since we are here, this means we found the tx, so mark it as completed
    await step.run("mark tx as completed", async () => {
      await db.lotTransaction.update({
        where: {
          id: lotTx.id
        },
        data: {
          completed: true,
          completedAt: new Date(),
        }
      })
    });

    await step.run('add history entry', async () => {
      await db.lot.update({
        where: {
          id: lotTx.lotId
        },
        data: {
          history: {
            create: {
              event: `[CHAIN] Transaction ${txHash} confirmed and marked as completed.`,
            }
          }
        }
      })
    })
  }
)
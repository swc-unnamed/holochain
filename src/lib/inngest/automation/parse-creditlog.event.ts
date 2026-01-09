import { db } from "$lib/db/prisma";
import { inngest } from "../client";

export type ParseCreditlogEventParams = {
  combineCreditLogId: string;
}

export const parseCreditlogEvent = inngest.createFunction(
  {
    id: 'parse-creditlog-event',
    retries: 3,
    timeouts: {
      finish: '60s'
    },
    concurrency: 10,
  },
  {
    event: 'automation/parse-creditlog'
  },
  async ({ event, logger, step }) => {
    logger.info("Parse creditlog event triggered", { event });

    const { combineCreditLogId } = event.data;

    const creditLog = await step.run('fetch credit log', async () => {
      const creditLogEntry = await db.combineCreditLog.findUniqueOrThrow({
        where: {
          id: combineCreditLogId,
        }
      });

      return creditLogEntry;
    });

    await step.run('parse credit log', async () => {
      const communication = creditLog.communication;

      // if the communication contains "atx_" and a bunch of alphanumeric characters, extract it up to the first space
      const atxMatch = communication.match(/atx_[a-zA-Z0-9]+/);
      if (atxMatch) {
        const atxHash = atxMatch[0];
        logger.info(`Found atx ID in credit log: ${atxHash}`);

        await inngest.send({
          name: 'automation/lot-tx.update',
          data: {
            txHash: atxHash,
            combineCreditLogId: combineCreditLogId,
          }
        });

        logger.info("sent lot-tx.update event for atx hash");
        return;
      } else {
        logger.info("No atx ID found in credit log communication");
        await db.combineCreditLog.update({
          where: {
            id: combineCreditLogId,
          },
          data: {
            processed: true,
            processedAt: new Date(),
            processedNotes: "No atx hash found in communication",
          }
        })
      }
    });
  }
)
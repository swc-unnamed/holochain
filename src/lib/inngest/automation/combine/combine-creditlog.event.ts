import { getMarketAccessToken } from "$lib/utils/auth/combine-admin";
import { SWCombine } from "swcombine-sdk";
import { inngest } from "../client";
import { db } from "$lib/db/prisma";
import type { CombineCreditLog } from "$lib/generated/prisma/client";

export type UpdateCombineCreditLogEventParams = {
  timestamp?: Date;
}

export const updateCombineCreditLogEvent = inngest.createFunction(
  {
    id: 'combine-creditlog-update-event',
    retries: 3,
    timeouts: {
      finish: '60s'
    }
  },
  {
    event: 'automation/combine.credit-log.update'
  },
  async ({ event, logger, step }) => {
    logger.info("Credit log checkpoint event triggered", { event });

    const accessToken = await step.run('get combine token', async () => {
      return await getMarketAccessToken();
    });

    const lastCheckpoint = await step.run('get last checkpoint', async () => {
      const checkpoint = await db.combineCreditLog.findFirst({
        orderBy: {
          id: 'desc'
        },
      });

      console.log('Last checkpoint:', checkpoint);

      if (checkpoint) return checkpoint;

      const newCheckpoint = await db.combineCreditLog.create({
        data: {
          transactionId: 128873365,
          amount: 0,
          communication: 'Big Bang',
          sender: 'system',
          receiver: 'system',
          timestamp: 0,
        }
      });

      return newCheckpoint;
    });

    const creditLogs = await step.run('fetch credit logs', async () => {
      const client = new SWCombine({
        clientId: '',
        clientSecret: '',
        token: accessToken,
      });

      const creditLogs = await client.faction.creditlog.list({
        factionId: '20:1840',
        start_id: lastCheckpoint.transactionId,
        item_count: 1000,
      });

      logger.info(`Fetched ${creditLogs.length} credit logs from Combine`);

      return creditLogs;
    });

    const newEntries = await step.run('update credit lot', async () => {
      const entries: CombineCreditLog[] = [];
      for (const log of creditLogs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logRecord = log as any;

        // Checking if the log's transaction id is greater than the last checkpoint
        // to avoid duplicates
        if (logRecord.attributes.transaction_id <= lastCheckpoint.transactionId) {
          logger.info(`Skipping log with transaction id ${logRecord.attributes.transaction_id} as it is less than or equal to last checkpoint ${lastCheckpoint.transactionId}`);
          continue;
        }
        const entry = await db.combineCreditLog.create({
          data: {
            transactionId: logRecord.attributes.transaction_id ?? 0,
            amount: logRecord.amount ?? 0,
            communication: logRecord.communication,
            sender: logRecord.sender.value,
            receiver: logRecord.receiver.value,
            timestamp: Number(logRecord.time.timestamp),
          }
        });

        entries.push(entry);
      }

      logger.info(`Inserted ${entries.length} new credit log entries into the database`);
      return entries;
    });

    for (const entry of newEntries) {
      logger.info(`New credit log entry: ${entry.id} with transaction ID ${entry.transactionId}`);
      await inngest.send({
        name: 'automation/parse-creditlog',
        data: {
          combineCreditLogId: entry.id,
        }
      })
    }

    return { creditLogs };
  }
)
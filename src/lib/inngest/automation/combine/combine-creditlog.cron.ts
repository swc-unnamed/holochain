import { inngest } from "../../client";


export const combineCreditLogCron = inngest.createFunction(
  {
    id: 'combine-creditlog-cron',
  },
  {
    cron: "TZ=America/New_York */5 * * * *",
  },
  async ({ logger }) => {
    logger.info("Credit log checkpoint cron executed");

    // await inngest.send({
    //   name: 'automation/credit-log-checkpoint',
    //   data: {
    //     timestamp: new Date(),
    //   }
    // })
  }
)
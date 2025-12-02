import { logger, task } from "@trigger.dev/sdk";

export const newAuctionTask = task({
  id: "auction-created-task",
  maxDuration: 60,
  run: async (payload: { auctionId: string }) => {
    const { auctionId } = payload;

    logger.log("executing new auction task", { auctionId });


    return {
      message: "New auction task executed successfully",
    }
  }
});

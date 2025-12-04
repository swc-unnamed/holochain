import { logger, task } from '@trigger.dev/sdk/v3';

export const bannedUserEventTask = task({
  id: 'user-banned-event',
  maxDuration: 60, // 1 minute
  run: async (payload: { userId: string, reason: string }) => {
    logger.log('executing banned user event task');

    logger.debug('going to wait for 10 seconds to simulate work', {
      payload: payload
    });

    return {
      message: 'Banned user event processed',
    }
  }
})
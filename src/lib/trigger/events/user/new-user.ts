import { logger, task, wait } from '@trigger.dev/sdk/v3';

export const newUserEventTask = task({
  id: 'new-user-event',
  maxDuration: 60, // 1 minute
  run: async (payload: { userId: string; }, { ctx }) => {
    logger.log('executing new user event task');

    logger.info('New user created', { payload, ctx });

    await wait.for({
      seconds: 10,
    });

    logger.info('Finished processing new user event', { payload, ctx });

    return {
      message: 'New user event processed',
    };
  }
})
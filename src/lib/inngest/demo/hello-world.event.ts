import { inngest } from '../client';

export const helloWorld = inngest.createFunction(
  {
    id: 'hello-world',
    description: 'A simple hello world function that waits for 5 seconds before responding.',
  },
  { event: 'demo/hello.world' },
  async ({ event, step, logger }) => {

    await step.sleep("wait", "1m");

    logger.info("Hello world function completed.");

    await step.sleep('final-wait', '5m');
    return {
      message: `Hello ${event.name}!`
    };
  }
);
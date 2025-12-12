import { command } from "$app/server";
import { inngest } from '$lib/inngest';

export const testInngest = command(async () => {
  await inngest.send({
    name: 'demo/hello.world',
    data: {
      message: `This is a test message from testInggest command.`
    }
  });
});

export const cancelTest = command(async () => {
  await inngest.send({
    name: 'demo/cancel.hello.world',
    data: {
      reason: `just beacause`
    }
  });
});
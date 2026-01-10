import { command } from "$app/server";
import { inngest } from "$lib/inngest";


export const triggerCreditCheckpoint = command(async () => {
  await inngest.send({
    name: 'automation/combine.credit-log.update',
    data: {
      timestamp: new Date(),
    }
  });
});
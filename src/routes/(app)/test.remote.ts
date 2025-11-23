import { command, query } from "$app/server";
import { newUserEventTask } from "../../lib/trigger/events/user/new-user";
import "dotenv/config";

export const testTrigger = command(async () => {
  await newUserEventTask.trigger({ userId: "test-user-id" }, {
    metadata: {
      type: 'testing'
    }
  });
  return { success: true };
});

export const testRemote = query(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" }
  ]
})
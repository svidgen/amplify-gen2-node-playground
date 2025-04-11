import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";
import type { SelectionSet } from "aws-amplify/data";
import { configureAmplify } from "../util";

async function main() {
  configureAmplify();
  const client = generateClient<Schema>();

  // Subscribe to the mutations triggered by the EventBridge rule
  const sub = client.subscriptions.onOrderFromEventBridge().subscribe({
    next: (data) => {
      console.log('received', data);
    },
  });
  
  console.log('subscribed');

  await client.mutations.publishOrderToEventBridge({
    orderId: 'order-123',
    status: 'SHIPPED',
    message: 'revision 1'
  });

  console.log('message published');

  await new Promise(unsleep => setTimeout(unsleep, 1000));
  console.log('slept');
}

main();
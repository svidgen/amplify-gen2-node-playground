import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";
import { authenticate, configureAmplify } from "../util";

configureAmplify();

async function main() {
  await authenticate();
  
  const client = generateClient<Schema>();

  const { data: chat, errors } = await client.conversations.chat.create();

  if (!chat) throw new Error("Couldn't create conversation.");
  console.log("Conversation created.");

  const sub = chat.onStreamEvent({
    next(event) {
      console.log(event);
    },
    error(error) {
      console.error(error);
    }
  });

  await chat.sendMessage("Hi. How are you? What can you do for me?");
}

main();

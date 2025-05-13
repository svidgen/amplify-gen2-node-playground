import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";
import { authenticate, configureAmplify, logFetch, logWebSocket } from "../util";

const DEBUG = process.argv.some((arg) => ['--debug', '-d'].includes(arg));
const VERBOSE = process.argv.some((arg) => ['--verbose', '-v'].includes(arg));

configureAmplify();

async function main() {
  await authenticate();

  if (DEBUG || VERBOSE) {
    logFetch();
    logWebSocket();
  }

  const client = generateClient<Schema>({ authMode: "userPool" });

  const { data: chat, errors } = await client.conversations.chat.create();

  if (!chat) throw new Error("Couldn't create conversation.");
  console.log("Conversation created.\n");

  const sub = chat.onStreamEvent({
    next(event) {
      if (event.stopReason) {
        process.stdout.write('\n\n');
        sub.unsubscribe();
        process.exit(0);
      } else {
        process.stdout.write(event.text || "");
      }
    },
    error(error) {
      console.error(error);
    }
  });

  await chat.sendMessage("Hi. How are you? What can you do for me?");
}

main();

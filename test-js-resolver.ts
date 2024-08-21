import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";

Amplify.configure(config);

async function main() {
  const client = generateClient<Schema>();
  const { data, errors } = await client.queries.echoWithJSResolver({
    echoString: "a string",
  });
  console.log({ data, errors });
}

main();

import prompts from "prompts";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api";
import { signIn, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";

import crypto from "crypto";
(global as any).window = {
  crypto,
};

Amplify.configure(config);

async function promptForCreds() {
  return prompts([
    {
      type: "text",
      name: "username",
      message: "Username",
    },
    {
      type: "password",
      name: "password",
      message: "Password",
    },
  ]) as Promise<{ username: string; password: string }>;
}

async function authenticate() {
  const { username, password } = await promptForCreds();
  return signIn({ username, password });
}

async function main() {
  await authenticate();

  const user = await getCurrentUser();
  console.log({ user });

  const session = await fetchAuthSession();
  console.log({ session });
  // const client = generateClient<Schema>();
}

main();

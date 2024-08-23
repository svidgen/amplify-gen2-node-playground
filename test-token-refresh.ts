import prompts from "prompts";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api";
import { signIn, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { TokenStorage } from "./util/token-store";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";

import crypto from "crypto";
(global as any).window = {
  crypto,
};

const tokenStore = new TokenStorage();

function configure() {
  Amplify.configure(config);
  cognitoUserPoolsTokenProvider.setKeyValueStorage(tokenStore);
}

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
  return signIn({
    username,
    password,
  });
}

async function getAuthSessionJSON() {
  return JSON.stringify(await fetchAuthSession(), null, 2);
}

async function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  configure();
  await authenticate();
  console.log("fetchAuthSession", await getAuthSessionJSON());

  await pause(1234);
  console.log("done pausing");

  await tokenStore.expireTokens();
  configure();
  const a = await getAuthSessionJSON();
  const b = await getAuthSessionJSON();
  console.log("after expiration and re-config", {
    a,
    b,
  });
}

main();

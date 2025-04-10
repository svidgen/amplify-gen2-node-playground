import crypto from "crypto";
import prompts from "prompts";
import { Amplify } from "aws-amplify";
import { TokenStorage } from "./token-store";
import { signIn, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { w3cwebsocket } from "websocket";
import config from "../amplify_outputs.json";

export const tokenStore = new TokenStorage();

export function configureAmplify() {
  (globalThis as any).window = {
    crypto,
    WebSocket: w3cwebsocket
  };
  Amplify.configure(config);
  cognitoUserPoolsTokenProvider.setKeyValueStorage(tokenStore);
}

export async function promptForCreds() {
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

export async function authenticate() {
  try {
    return await getCurrentUser();
  } catch {
    const { username, password } = await promptForCreds();
    await signIn({
      username,
      password,
    });
    return await getCurrentUser();
  }
}

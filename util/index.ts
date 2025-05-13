import crypto from "crypto";
import prompts from "prompts";
import { Amplify } from "aws-amplify";
import { TokenStorage } from "./token-store";
import { signIn, signUp, confirmSignUp, getCurrentUser } from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { w3cwebsocket } from "websocket";

// Exists after deployment.
// @ts-ignore
import config from "../amplify_outputs.json";

export const tokenStore = new TokenStorage();

let isConfigured = false;

/**
 * Idempotent. Safe to call multiple times.
 * @returns 
 */
export function configureAmplify() {
  if (isConfigured) return;
  (global as any).crypto = crypto;
  (global as any).WebSocket = w3cwebsocket;
  Amplify.configure(config);
  cognitoUserPoolsTokenProvider.setKeyValueStorage(tokenStore);
  isConfigured = true;
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

async function promptForCode() {
  return prompts([
    {
      type: "text",
      name: "confirmationCode",
      message: "Confirmation Code",
    },
  ]) as Promise<{ confirmationCode: string }>;
}

async function promptAuthAction() {
  return prompts([
    {
      type: "select",
      name: "action",
      message: "Sign In or Sign Up",
      choices: [
        { title: "Sign In", value: "signin" },
        { title: "Sign Up", value: "signup" },
      ],
    },
  ]) as Promise<{ action: "signin" | "signup" }>;
}

export async function authenticate() {
  configureAmplify();
  try {
    return await getCurrentUser();
  } catch {
    const { action } = await promptAuthAction();
    if (action === "signin") {
      return signin();
    } else {
      await signup();
      console.log("Sign up complete. Please sign in.");
      return signin();
    }
  }
}

export async function signin() {
  configureAmplify();
  const { username, password } = await promptForCreds();
  await signIn({
    username,
    password,
  });
  return await getCurrentUser();
}

export async function signup() {
  configureAmplify();
  const { username, password } = await promptForCreds();
  await signUp({
    username,
    password,
  });
  const { confirmationCode } = await promptForCode();
  const result = await confirmSignUp({
    username,
    confirmationCode: confirmationCode,
  });
}
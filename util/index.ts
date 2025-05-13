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

export function logFetch() {
  globalThis.originalFetch = globalThis.fetch;
  (globalThis as any).fetch = async (...args: any) => {
    console.log('calling fetch with', args);
    const response = await globalThis.originalFetch(...args);
    const cloned = (response as Awaited<ReturnType<typeof fetch>>).clone();
    console.log('fetch response', {
      status: cloned.status,
      statusText: cloned.statusText,
      headers: Object.fromEntries(cloned.headers.entries()),
      body: await cloned.text(),
    });
    return response;
  }
}

export function logWebSocket() {
  class DebugWebSocket {
    private ws: InstanceType<typeof w3cwebsocket>;
  
    constructor(...args: ConstructorParameters<typeof w3cwebsocket>) {
      console.log("\nWebSocket CONNECT:", ...args, '\n');
      this.ws = new w3cwebsocket(...args);
  
      // Forward properties
      Object.setPrototypeOf(this, this.ws);
  
      // Wrap event handlers
      this.ws.onopen = (...args) => {
        console.log("\nWebSocket OPEN\n");
        this.onopen?.(...args);
      };
      this.ws.onmessage = (msg) => {
        let data: string;
        try {
          data = JSON.parse(msg.data);
        } catch (e) {
          data = msg.data;
        }
        console.log("\n\nWebSocket MESSAGE:");
        console.dir(data, { depth: 10 });
        this.onmessage?.(msg);
      };
      this.ws.onerror = (err) => {
        console.error("\n\nWebSocket ERROR:", err, '\n');
        this.onerror?.(err);
      };
      this.ws.onclose = (...args) => {
        console.log("\nWebSocket CLOSE\n");
        this.onclose?.(...args);
      };
    }
  
    // Proxy API methods like send()
    send(data: any) {
      console.log("\nWebSocket SEND:", data, '\n');
      this.ws.send(data);
    }
  
    close(code?: number, reason?: string) {
      console.log("\nWebSocket CLOSE CALLED", code, reason, '\n');
      this.ws.close(code, reason);
    }
  
    // Forward all other properties dynamically
    [key: string]: any;
  }

  (globalThis as any).WebSocket = DebugWebSocket;
}

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
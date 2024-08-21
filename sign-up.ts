import prompts from "prompts";
import { Amplify } from "aws-amplify";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import config from "./amplify_outputs.json";

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

async function promptForCode() {
  return prompts([
    {
      type: "text",
      name: "confirmationCode",
      message: "Confirmation Code",
    },
  ]) as Promise<{ confirmationCode: string }>;
}

async function main() {
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
  console.log({ result });
}

main();

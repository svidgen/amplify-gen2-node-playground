import { configureAmplify, signup } from "../util";

configureAmplify();

async function main() {
  const result = await signup();
  console.log({ result });
}

main();

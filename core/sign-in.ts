import { authenticate, configureAmplify } from "../util";

configureAmplify();

async function main() {
  const user = await authenticate();
  console.log(`Signed in as ${user.signInDetails?.loginId}`);
}

main();

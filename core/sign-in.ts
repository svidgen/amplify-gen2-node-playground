import { authenticate } from "../util";

async function main() {
  const user = await authenticate();
  console.log(`Signed in as ${user.signInDetails?.loginId}`);
}

main();

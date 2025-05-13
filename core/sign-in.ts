import { signin } from "../util";

async function main() {
  const user = await signin();
  console.log(`Signed in as ${user.signInDetails?.loginId}`);
}

main();

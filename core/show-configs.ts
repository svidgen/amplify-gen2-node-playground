import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { authenticate } from "../util/index";

async function main() {
  await authenticate();

  const user = await getCurrentUser();
  const session = await fetchAuthSession();

  console.log("getConfig", Amplify.getConfig());
  console.log("getCurrentUser", user);
  console.log("fetchAuthSession", session);
  console.log("fetchAuthSession.accessToken", {
    accessToken: {
      toString: session.tokens?.accessToken.toString(),
      payload: session.tokens?.accessToken.payload,
    },
    idToken: {
      toString: session.tokens?.idToken?.toString(),
      payload: session.tokens?.idToken?.payload,
    },
  });
}

main();

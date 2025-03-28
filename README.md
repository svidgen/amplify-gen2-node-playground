# [One of] Jon's Amplify Gen2 Testing and Troubleshooting Repo's

This "app" client runs in the CLI. But, it uses the normal `aws-amplify` client libraries. Hence, auth is managed via a custom token provider.

The `WebSocket` client must be injected into `global` prior to use on any script that needs them.

```
import { w3cwebsocket } from "websocket";
(global as any).WebSocket = w3cwebsocket;
```

## Deploy sandbox

```
npx ampx sandbox
```

## Create an account on the CLI

```
npx tsx sign-up.ts
```

Username must be an email address. A confirmation code will be emailed.

## Sign in

```
npx tsx sign-in.ts
```

Auth tokens are stored in `.tokens.json`.

## Sign out

```
rm .tokens.json
```

## Run one of the samples

```
npx tsx ____.ts
```

For example:

```
npx tsx basic-has-one-testing.ts
```

## That's it

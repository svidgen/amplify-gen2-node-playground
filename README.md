# [One of] Jon's Amplify Gen2 Testing and Troubleshooting Repo's

Useful for quickly testing Amplify gen2 apps in the CLI.

1. Fork and/or `git clone` the repository.
2. Use node 20+. (E.q., `nvm use 22`.)
3. `npm i`
4. `npx ampx sandbox` (Uses your local AWS auth and can accept a `--profile` argument.)

This will deploy the sandbox (backend) to your account.

If you're creating multiple branches for multiple investigations, I suggest changing the package name in each branch to ensure each branch operates against a distinct sandbox.

# Auth

## Create an account on the CLI

```
npx tsx core/sign-up.ts
```

Username must be an email address. A confirmation code will be emailed.

## Sign in

```
npx tsx core/sign-in.ts
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
npx tsx scripts/example.ts
```

You'll notice in the example that Amplify configuration runs through a utility. This utility injects the token storage that uses `.tokens.json`. This configuration utility also injects the `WebSocket` class.

The example doesn't actually use owner auth for anything. But, I'm *pretty sure* from running tests on other branches that it works!

## That's it

import { a as _AY, defineFunction } from "@aws-amplify/backend";

const eff = defineFunction({
  entry: "./handlers/test-handler.ts",
});

type Namespace<T extends Record<string, any>, NS extends string> = {
  [K in keyof T as K extends string ? `${NS}${K}` : K]: T[K];
};

function addNamespace<T extends Record<string, any>, NS extends string>(
  o: T,
  ns: NS
): Namespace<T, NS> {
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => [`${ns}${k}`, v])
  ) as any;
}

export function buildCommands<T extends string = "Admin">({
  a,
  namespace,
}: {
  a: typeof _AY;
  namespace: T;
}) {
  return addNamespace(
    {
      DoSomething: a
        .mutation()
        .arguments({
          input: a.string(),
        })
        .returns(a.string())
        .handler(a.handler.function(eff))
        .authorization((allow) => [allow.authenticated()]),
    },
    namespace
  );
}

// export function buildJustOneCommand() {
//   return a
//     .mutation()
//     .arguments({
//       input: a.string(),
//     })
//     .returns(a.string())
//     .handler(a.handler.function(eff))
//     .authorization((allow) => [allow.authenticated()]);
// }

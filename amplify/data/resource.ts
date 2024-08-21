import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";
import { buildCommands } from "../schema-helpers/test-schema-helper";

const echoHandler = defineFunction({
  entry: "./echo-handler/handler.ts",
});

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/

const ValidStatuses = ["Active", "Inactive", "Unknown"] as const;

const schema = a
  .schema({
    Todo: a.model({
      title: a.string(),
      content: a.hasOne("Content", "todoId"),
    }),
    Content: a.model({
      todoId: a.id(),
      todo: a.belongsTo("Todo", "todoId"),
      text: a.string(),
    }),
    Status: a.enum(ValidStatuses),
    PlayerCharacterRelationship: a
      .model({
        name: a.string(),
        value: a.integer(),
        lastConversation: a.hasOne("Conversation", "pcId"),
      })
      .secondaryIndexes((idx) => [idx("name").sortKeys(["value"])]),
    Conversation: a.model({
      title: a.string(),
      pcId: a.id(),
      playerCharacter: a.belongsTo("PlayerCharacterRelationship", "pcId"),
    }),
    Customers: a
      .model({
        firstName: a.string().required(),
        lastName: a.string(),
      })
      .authorization((allow) => [allow.publicApiKey(), allow.guest()]),
    MyOwnDataThing: a
      .model({
        key: a.string().required(),
        value: a.string(),
      })
      .authorization((allow) => [allow.owner()])
      .secondaryIndexes((idx) => [idx("key")]),
    NamedValue: a.customType({
      name: a.string(),
      value: a.string(),
    }),
    echoEnum: a
      .query()
      .arguments({
        status: a.string(),
        // status: a.enum(ValidStatuses),
        // status: a.ref("NamedValue") as any,
      })
      .returns(a.ref("Status"))
      .handler(a.handler.function(echoHandler))
      .authorization((allow) => [allow.publicApiKey(), allow.guest()]),
    // ...buildCommands({ a, namespace: "myNamespaced" }),
    echoWithJSResolver: a
      .query()
      .arguments({
        echoString: a.string(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.publicApiKey()])
      .handler([
        a.handler.custom({
          entry: "./custom-handlers/getSomeCustomer-handler-copy.js",
          // dataSource: a.ref("NamedValue"), // whatever
        }),
      ]),
  })
  .authorization((allow) => [allow.publicApiKey()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 300,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

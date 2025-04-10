import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";
// import { buildCommands } from "../schema-helpers/test-schema-helper";

const echoHandler = defineFunction({
  entry: "./echo-handler/handler.ts",
});

// const getCompanyByIdHander = defineFunction({
//   entry: "./echo-handler/getCompanyByIdLambda.ts",
// });

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/

const ValidStatuses = ["Active", "Inactive", "Unknown"] as const;

const schema = a
  .schema({
    ThingWithRequiredId: a.model({
      id: a.integer().required(),
      defaultedField: a.string(),
    }),
    Todo: a.model({
      title: a.string(),
      content: a.hasOne("Content", "todoId"),
    }),
    Content: a.model({
      todoId: a.id(),
      todo: a.belongsTo("Todo", "todoId"),
      text: a.string(),
    }),
    hasManyParent: a.model({
      parentContent: a.string(),
      children: a.hasMany("hasManyChild", ["parentId"]),
    }),
    hasManyChild: a.model({
      childContent: a.string(),
      parentId: a.id().required(),
      hasManyParent: a.belongsTo("hasManyParent", ["parentId"]),
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
      .authorization((allow) => [allow.guest()]),
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

    // testing cycles between customTypes
    // MasterTenantTable: a
    //   .model({
    //     pk: a.string().required(),
    //     sk: a.string().required(),
    //     company_id: a.id(),
    //   })
    //   .authorization((allow) => [allow.publicApiKey()]),
    // Tenant: a.customType({
    //   company: a.ref("Company"),
    //   company_id: a.id().required(),
    // }),
    // Company: a.customType({
    //   tenants: a.ref("Tenant").array(),
    // }),
    // getCompanyById: a
    //   .query()
    //   .arguments({ company_id: a.id().required() })
    //   .returns(a.ref("Tenant").array())
    //   .authorization((allow) => [allow.authenticated()])
    //   .handler(a.handler.function(getCompanyByIdHander)),

    // testing AI
    summarize: a.generation({
      aiModel: a.ai.model('Claude 3 Haiku'),
      systemPrompt: "Summarize the following text:",
    })
    .arguments({
      text: a.string().required()
    })
    .returns(a.customType({
      summary: a.string()
    }))
    .authorization((allow) => [allow.publicApiKey()])
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

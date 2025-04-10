import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";

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

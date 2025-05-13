import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";

const schema = a
  .schema({
    Todo: a.model({
      title: a.string().required(),
      content: a.string(),
      owner: a.string(),
    }).authorization(allow => [allow.owner()]),

    chat: a.conversation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: `You are a helpful assistant`,
    })
    .authorization((allow) => allow.owner()),

    summarize: a
      .generation({
        aiModel: a.ai.model("Claude 3 Sonnet"),
        systemPrompt: "Summarize the following text:",
      })
      .arguments({
        text: a.string().required(),
      })
      .returns(
        a.customType({
          summary: a.string(),
        })
      )
      .authorization((allow) => [allow.publicApiKey()]),

  })

console.log(schema.transform().schema);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 300,
    },
  },
});

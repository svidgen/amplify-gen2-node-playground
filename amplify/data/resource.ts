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

    // Dummy: a.model({
    //   field: a.ref('OrderStatusChange')
    // }).authorization(allow => [allow.group('does-not-exist')]),

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
    .authorization((allow) => [allow.publicApiKey()]),

    // for testing event bridge
    OrderStatus: a.enum(["PENDING", "SHIPPED", "DELIVERED"]),
    OrderStatusChange: a.customType({
      orderId: a.id().required(),
      status: a.ref("OrderStatus").required(),
      message: a.string().required(),
    }),

      
  publishOrderToEventBridge: a
    .mutation()
    .arguments({
      orderId: a.id().required(),
      status: a.string().required(),
      message: a.string().required(),
    })
    .returns(a.ref("OrderStatusChange"))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        dataSource: "EventBridgeDataSource",
        entry: "./publishOrderToEventBridge.js",
      })
    ),
  publishOrderFromEventBridge: a
    .mutation()
    .arguments({
      orderId: a.id().required(),
      status: a.string().required(),
      message: a.string().required(),
    })
    .returns(a.ref("OrderStatusChange"))
    // https://github.com/aws-amplify/amplify-data/blob/2add2bd443b676279cdd7394db12bec2f3ddf287/packages/data-schema/src/SchemaProcessor.ts#L843
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./publishOrderFromEventBridge.js",
      })
    ),
  onOrderFromEventBridge: a
    .subscription()
    .for(a.ref("publishOrderFromEventBridge"))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./onOrderFromEventBridge.js",
      })
    ),
    })
  .authorization((allow) => [allow.publicApiKey()]);

console.log(schema.transform().schema);

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

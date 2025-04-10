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
    .authorization((allow) => [allow.publicApiKey()]),

    // for testing event bridge
    OrderStatus: a.enum(["OrderPending", "OrderShipped", "OrderDelivered"]),
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
    .authorization((allow) => [allow.publicApiKey(), allow.guest()])
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

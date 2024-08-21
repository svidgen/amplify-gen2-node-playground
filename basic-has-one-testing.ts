import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";
import { w3cwebsocket } from "websocket";
import type { SelectionSet } from "aws-amplify/data";

(global as any).WebSocket = w3cwebsocket;

Amplify.configure(config);

async function main() {
  const client = generateClient<Schema>();

  // const result = await client.queries.echoEnum({ status: "Active" });
  // console.log(result);

  // client.models.Customers.observeQuery({
  //   selectionSet: ["id", "firstName", "lastName"],
  // }).subscribe({
  //   next({ items }) {
  //     console.log(items);
  //   },
  // });

  // client.models.Customers.onCreate({
  //   selectionSet: ["firstName"],
  // }).subscribe({
  //   next({ firstName }) {
  //     console.log("created", firstName);
  //   },
  // });

  // client.models.Customers.create({
  //   firstName: "some",
  // });

  const selectionSet = ["id", "title", "content.*"] as const;
  type TodoModel = SelectionSet<Schema["Todo"]["type"], typeof selectionSet>;

  const sub = client.models.Todo.observeQuery({
    selectionSet: [...selectionSet],
  }).subscribe({
    next({ items }) {
      console.log(items);
    },
  });

  await new Promise((unsleep) => setTimeout(unsleep, 1000));

  console.log("after sleep");

  const { data: todo } = await client.models.Todo.create({
    title: "a new todo",
  });

  console.log("after create todo");

  const { data: content } = await client.models.Content.create({
    todoId: todo?.id,
    text: "some content text",
  });

  console.log("after create content");

  await client.models.Todo.update(todo!);

  console.log("after 'touch' todo");

  // try {
  // const request = client.models.PlayerCharacterRelationship.
  // const request = client.models.PlayerCharacterRelationship.list();
  // const request = client.graphql({
  //   query: `
  //     query x {
  //       listPlayerCharacterRelationship {
  //         items {
  //           id
  //         }
  //       }
  //     }
  //   `,
  // }) as any;
  // client.cancel(request);
  // const { data, errors } = await request;
  // console.log({ data, errors });
  // } catch (error) {
  //   console.log("caught", error);
  // }

  // const { data: listResult } =
  //   await client.models.PlayerCharacterRelationship.list({
  //     filter: {
  //       createdAt: { gt: "2022-02-02" },
  //     },
  //   });
  // console.log({ listResult });

  // const { data: pc } = await client.models.PlayerCharacterRelationship.create(
  //   {}
  // );

  // console.log({ pc });

  // const { data: convo } = await client.models.Conversation.create({
  //   title: "some title",
  //   pcId: pc?.id,
  // });

  // const { data: listedConvos } = await client.models.Conversation.list({
  //   filter: {
  //     createdAt: { gt: "2024-06-19" },
  //   },
  // });

  // console.log({ listedConvos });

  // const { data: pcEager } = await client.models.PlayerCharacterRelationship.get(
  //   {
  //     id: pc!.id,
  //   },
  //   { selectionSet: ["id", "lastConversation.*"] }
  // );

  // console.log("created", {
  //   pc,
  //   pcEager,
  //   convo,
  //   lastConvo: await pc?.lastConversation(),
  // });

  // const { data: deletedConvo } = await client.models.Conversation.delete({
  //   ...convo!,
  // });

  // const { data: pcEagerAfterDelete } =
  //   await client.models.PlayerCharacterRelationship.get(
  //     {
  //       id: pc!.id,
  //     },
  //     { selectionSet: ["id", "lastConversation.*"] }
  //   );

  // console.log("after convo deletion", {
  //   lazyPc: await pc?.lastConversation(),
  //   pcEagerAfterDelete,
  // });
}

main();

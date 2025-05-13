import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";
import type { SelectionSet } from "aws-amplify/data";
import { authenticate, configureAmplify } from "../util";

configureAmplify();

async function main() {
  const user = await authenticate();
  console.log(`Logged in as ${user.signInDetails?.loginId}.`);

  const client = generateClient<Schema>({ authMode: 'userPool' });

  // cleanup  }
  const { data: todos } = await client.models.Todo.list();
  for (const todo of todos) {
    console.log("deleting", todo);
    await client.models.Todo.delete(todo);
  }

  // test

  const selectionSet = ["id", "title", "content"] as const;
  type TodoModel = SelectionSet<Schema["Todo"]["type"], typeof selectionSet>;

  // seeding with an initial todo to show distinction

  const { data: initialTodo } = await client.models.Todo.create({
    title: "a pre-existing todo",
    content: 'some initial content text',
  });

  console.log("seeded some initial content to fetch", {
    initialTodo
  });

  console.log("starting observeQuery ...");

  // ok. now let's see how observeQuery differs when responding with initial Todo's
  // which come through the query as opposed to those that arrive later via the sub.

  const observeQuerySub = client.models.Todo.observeQuery({
    selectionSet: [...selectionSet],
  }).subscribe({
    next({ items }) {
      console.log("observeQuery update", items);
    },
  });

  const modeledOnUpdateSub = client.models.Todo.onUpdate({
    selectionSet: [...selectionSet],
  }).subscribe({
    next(item) {
      console.log("modeled onUpdate sub", JSON.stringify(item));
    },
  });

  const rawOnUpdateSub = (
    client.graphql({
      query: `subscription OnUpdateTodo {
      onUpdateTodo {
        id
        title
        content {
          id
          todoId
          text
          createdAt
          updatedAt
        }
      }
    }`,
    }) as any
  ).subscribe({
    next(item) {
      console.log("raw onUpdate sub", JSON.stringify(item, null, 2));
    },
  });

  await new Promise((unsleep) => setTimeout(unsleep, 1000));
  console.log("after sleep");

  const { data: todo } = await client.models.Todo.create({
    title: "a new todo",
    content: 'some content text',
  });
  console.log("after create todo");

  await new Promise((unsleep) => setTimeout(unsleep, 1000));

  // the customer would ideally like to see an update via the observeQuery here,
  // but since the new content doesn't touch the Todo, it won't trigger anything.
  // but, the customer should be able to pair the content create/update with a
  // simple mutation to "touch" the related Todo.

  const { data: touchedTodo } = await client.models.Todo.update(todo!, {
    // one of the problems is that our mutation operations do not allow
    // selection sets on the type level ... but ... they do support it
    // in the runtime. wtf?
    selectionSet,
  } as any);
  console.log("after 'touch' todo", { touchedTodo });
  await new Promise((unsleep) => setTimeout(unsleep, 1000));

  // here, we see TODO's log out again, indicating that the "touch" worked; but
  // observeQuery still returns the Todo with a lazy loader, which is *not* what
  // we want.

  // why isn't this letting the app close ... we leaking something?
  observeQuerySub.unsubscribe();
  modeledOnUpdateSub.unsubscribe();
  rawOnUpdateSub.unsubscribe();

  // unrelated to the customer ask, but would like to understand what's keeping the
  // process open after this point. some research to do.
}

main();

import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient } from "aws-amplify/api";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";
import { w3cwebsocket } from "websocket";
import type { SelectionSet } from "aws-amplify/data";

(global as any).WebSocket = w3cwebsocket;

Amplify.configure(config);

/**
 *             "defaultedField": {
              "name": "defaultedField",
              "isArray": false,
              "type": "String",
              "isRequired": false,
              "attributes": []
            },
 */

async function main() {
  const client = generateClient<Schema>();

  // cleanup

  const { data: hasManyChildren } = await client.models.hasManyChild.list();
  for (const c of hasManyChildren) {
    console.log("deleting", c);
    await client.models.hasManyChild.delete(c);
  }

  const { data: hasManyParents } = await client.models.hasManyParent.list();
  for (const p of hasManyParents) {
    console.log("deleting", p);
    await client.models.hasManyParent.delete(p);
  }

  // create

  const { data: createdParent } = await client.models.hasManyParent.create({
    parentContent: "some parent content",
  });
  console.log({ createdParent });

  const { data: createdChild } = await client.models.hasManyChild.create({
    childContent: "some child content",
    parentId: createdParent!.id,
  });
  console.log({ createdChild });

  // test

  const { data: retrievedParent } = await client.models.hasManyParent.get(
    {
      id: createdParent!.id,
    },
    {
      selectionSet: ["id", "parentContent", "children.*"],
    }
  );
  console.log({ retrievedParent: JSON.stringify(retrievedParent, null, 2) });

  const { data: listedParents } = await client.models.hasManyParent.list({
    selectionSet: ["id", "parentContent", "children.*"],
  });
  console.log({ listedParents: JSON.stringify(listedParents, null, 2) });
}

main();

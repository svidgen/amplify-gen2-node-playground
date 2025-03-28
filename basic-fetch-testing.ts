import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { generateClient, post } from "aws-amplify/api";
import { Schema } from "./amplify/data/resource";
import config from "./amplify_outputs.json";
import { w3cwebsocket } from "websocket";
import type { SelectionSet } from "aws-amplify/data";

Amplify.configure(config);

Amplify.configure({
  ...Amplify.getConfig(),
  API: {
    ...Amplify.getConfig().API,
    REST: {
      customApi: {
        endpoint:
          "https://ab2njnw7ubgdzjd6z2udxxh344.appsync-api.us-west-1.amazonaws.com",
        region: config.data.aws_region,
      },
    },
  },
});

async function main() {
  // test raw fetch
  {
    const fetchTest = await fetch(config.data.url, {
      method: "post",
      headers: {
        "X-Api-Key": config.data.api_key,
      },
      body: JSON.stringify({
        query: `query ListContent {
          listContents {
            items {
              todoId
              text
              createdAt
              updatedAt
            }
          }
        }
      `,
      }),
    });

    const {
      data: {
        listContents: { items },
      },
      errors,
    } = await fetchTest.json();

    console.log("json result", items, errors);
  }

  // using `post`
  {
    const postTest = await post({
      apiName: "customApi",
      path: "/graphql",
      options: {
        headers: {
          "X-Api-Key": config.data.api_key,
        },
        body: {
          query: `query ListContent {
          listContents {
            items {
              todoId
              text
              createdAt
              updatedAt
            }
          }
        }
      `,
        },
      },
    });

    const {
      data: {
        listContents: { items },
      },
      errors,
    } = (await (await postTest.response).body.json()) as any;

    console.log("postTest", items);
  }

  // using `post` + guest IAM
  {
    const postTest = await post({
      apiName: "customApi",
      path: "/graphql",
      options: {
        // headers: {
        //   "X-Api-Key": config.data.api_key,
        // },
        body: {
          query: `query EchoEnum {
            echoEnum(status: "Active")
          }
        `,
        },
      },
    });

    console.log("postTest + IAM?", await (await postTest.response).body.json());
  }

  // using `post` + authenticated IAM
  {
    const postTest = await post({
      apiName: "customApi",
      path: "/graphql",
      options: {
        // headers: {
        //   "X-Api-Key": config.data.api_key,
        // },
        body: {
          query: `query EchoEnum {
            echoEnum(status: "Active")
          }
        `,
        },
      },
    });

    console.log("postTest + IAM?", await (await postTest.response).body.json());
  }
}

main();

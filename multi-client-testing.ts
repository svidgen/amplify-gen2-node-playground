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
    const clientA = generateClient<Schema>();

    // const { data: todos } = await clientA.models.Todo.list();
    // console.log({ todos });

    clientA.models.Todo.onCreate().subscribe({
        next(value) {
            console.log('todo created (sub)', value);
        },
    })

    const clientB = generateClient({
        endpoint: 'https://uspo6lmrr5gm5fjoptnlhogate.appsync-api.us-west-1.amazonaws.com/graphql',
        authMode: 'apiKey',
        // amazonq-ignore-next-line
        apiKey: 'da2-kwpicaojqzdtrnobijoqcekbdq'
    });

    const sub = clientB.graphql({
        query: `subscription Sub {
            onCreateStations {
                id
                name
            }
        }`
    });

    if ('subscribe' in sub) {
        console.log('subbing to stations create');
        sub.subscribe({
            next(value) {
                console.log('stations created (sub)', value)
            },
            error(err) {
                console.log('stations sub error', err)
            }
        })
    }

    console.log('starting subscriptions ...');
    await new Promise(unsleep => setTimeout(unsleep, 1000));
    console.log('subscription start rested. testing creates ...');

    try {
        const { data } = await clientA.models.Todo.create({
            title: 'a title'
        });
        console.log('todo created (result)', data);
    } catch (err) {
        console.error('Error creating Todo', err);
    }

    try {
        const result = await clientB.graphql({
            query: `mutation A {
                createStations(input: {name: "something", id: "${new Date().getTime()}" }) {
                    id
                    name
                }
            }`
        });
        console.log('stations created (result)', result);
    } catch (err) {
        console.error('Error creating stations', err);
    }

}

main();
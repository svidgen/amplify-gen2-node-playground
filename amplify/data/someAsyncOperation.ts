import type { Schema } from './resource';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/someAsyncOperation';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

export const handler: Schema['publishMessageAsync']['functionHandler'] = async (event) => {
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any);
  Amplify.configure(resourceConfig, libraryOptions);
  const client = generateClient<Schema>();

  // await new Promise(unsleep => setTimeout(unsleep, 5000));
  await client.models.AsyncMessage.create({
    title: `Message from someAsyncOperation at ${new Date().toLocaleString()}`,
    details: `Details we received from you: ${JSON.stringify(event.arguments, null, 2)}`,
  })
}
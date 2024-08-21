import { Schema } from "../resource";

export const handler: Schema["echoEnum"]["functionHandler"] = async (event) => {
  return event.arguments.status as any;
};

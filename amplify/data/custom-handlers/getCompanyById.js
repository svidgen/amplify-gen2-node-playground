import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    payload: ctx.args.echoString,
  };
}

export function response(ctx) {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}

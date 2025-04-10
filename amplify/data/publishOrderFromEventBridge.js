export function request(ctx) {
    return {
      payload: ctx.arguments,
    };
  }
  
  export function response(ctx) {
    return ctx.arguments;
  }
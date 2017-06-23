/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const errorHandlersMiddleware = [
  /**
   * Custom errors middleware.
   *
   * NOTE: the react application middleware hands 404 paths, but it is good to
   * have this backup for paths not handled by the react middleware. For
   * example you may bind a /api path to express.
   */
  async function errorHandlerMiddleware(ctx, next) {
    try {
      await next();
      if (ctx.response.status === 404 && !ctx.response.body) {
        ctx.throw('Sorry, that resource was not found', 404);
      }
    } catch (err) {
      console.log(err);
      console.log(err.stack);
      ctx.status = typeof err.status === 'number' ? err.status : 500; // eslint-disable-line no-param-reassign
      ctx.app.emit('Sorry, an unexpected error occurred.', err, ctx);
      await next();
    }
  },
];

export default errorHandlersMiddleware;

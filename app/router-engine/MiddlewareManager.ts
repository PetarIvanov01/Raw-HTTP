import { HttpHandler, Request, Socket } from "../types";

export class MiddlewareManager {
  private middlewares: HttpHandler[] = [];

  public use(handler: HttpHandler) {
    this.middlewares.push(handler);
  }

  public callMiddlewares(req: Request, socket: Socket) {
    if (this.middlewares.length > 0) {
      this.middlewares.forEach((middleware) => middleware(req, socket));
    }
  }
}

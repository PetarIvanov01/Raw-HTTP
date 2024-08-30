import type { HttpHandler, Request, Response } from "../types.d.js";

export class MiddlewareManager {
  private middlewares: HttpHandler[] = [];

  public use(handler: HttpHandler) {
    this.middlewares.push(handler);
  }

  public callMiddlewares(req: Request, res: Response) {
    if (this.middlewares.length > 0) {
      this.middlewares.forEach((middleware) => middleware(req, res));
    }
  }
}

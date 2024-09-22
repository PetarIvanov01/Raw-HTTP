import type { HttpHandler } from "../../types.js";

export class MiddlewareManager {
  private middlewares: HttpHandler[] = [];

  public use(handler: HttpHandler) {
    this.middlewares.push(handler);
  }

  public getMiddlewares() {
    return this.middlewares;
  }
}

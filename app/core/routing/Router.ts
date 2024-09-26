import type { HttpHandler, Socket } from "../../types.js";

import { RouteHandler } from "./RouteHandler.js";
import { MiddlewareManager } from "./MiddlewareManager.js";
import { RequestProcessor } from "./RequestProcessor.js";
import { RequestParser } from "./RequestParser.js";

export class Router {
  private static instance: Router;

  public static getInstance() {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  private routeHandler: RouteHandler;
  private middlewareManager: MiddlewareManager;
  private requestProcessor: RequestProcessor;

  private constructor() {
    this.routeHandler = new RouteHandler();
    this.middlewareManager = new MiddlewareManager();
    this.requestProcessor = new RequestProcessor(
      this.routeHandler,
      this.middlewareManager
    );
  }

  public dispatchIncomingRequest(parser: RequestParser, socket: Socket) {
    this.requestProcessor.processRequest(parser, socket);
  }

  public get(path: string, ...handlers: HttpHandler[]) {
    this.routeHandler.addRoute("GET", path, handlers);
  }

  public post(path: string, ...handlers: HttpHandler[]) {
    this.routeHandler.addRoute("POST", path, handlers);
  }

  public put(path: string, ...handlers: HttpHandler[]) {
    this.routeHandler.addRoute("PUT", path, handlers);
  }

  public delete(path: string, ...handlers: HttpHandler[]) {
    this.routeHandler.addRoute("DELETE", path, handlers);
  }

  public use(handler: HttpHandler) {
    this.middlewareManager.use(handler);
  }
}

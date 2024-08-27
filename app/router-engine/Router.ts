import { HttpHandler, Socket } from "../types";

import { RouteHandler } from "./RouteHandler";
import { MiddlewareManager } from "./MiddlewareManager";
import { RequestProcessor } from "./RequestProcessor";
import { RequestParser } from "./Parser";

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

  public get(path: string, handler: HttpHandler) {
    this.routeHandler.addRoute("GET", path, handler);
  }

  public post(path: string, handler: HttpHandler) {
    this.routeHandler.addRoute("POST", path, handler);
  }

  public use(handler: HttpHandler) {
    this.middlewareManager.use(handler);
  }
}

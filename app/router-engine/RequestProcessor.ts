import { RouteHandler } from "./RouteHandler";
import { MiddlewareManager } from "./MiddlewareManager";
import { Request, RequestStaticFiles, Socket } from "../types";

import { mimeType } from "../utils/parsers";

import serveStaticFilesHandler from "../handlers/serveStaticFilesHandler";
import handleNotFound from "../handlers/notFoundHandler";
import { RequestParser } from "./Parser";

export class RequestProcessor {
  constructor(
    private routeHandler: RouteHandler,
    private middlewareManager: MiddlewareManager
  ) {}

  public processRequest(parser: RequestParser, socket: Socket) {
    const { pathname, method, extension } = parser.getRequestLine();

    const route = this.routeHandler.findRoute(method, pathname);

    if (route) {
      const headers = parser.getRequestHeaders();
      const body = parser.getRequestBody();

      const request: Request = {
        pathname,
        method,
        extension,
        ...headers,
        body,
        params: {},
      };

      this.middlewareManager.callMiddlewares(request, socket);

      request.params = route.params;
      return route.handler(request, socket);
    }

    if (extension && mimeType[extension as keyof typeof mimeType]) {
      const headers = parser.getRequestHeaders();

      const request: RequestStaticFiles = {
        pathname,
        method,
        extension,
        ...headers,
      };
      return serveStaticFilesHandler(request, socket);
    }

    handleNotFound(socket);
  }
}

import { Request, RequestStaticFiles, Socket } from "../types";

import { RouteHandler } from "./RouteHandler";
import { MiddlewareManager } from "./MiddlewareManager";
import { HTTPResponse } from "./HTTPResponse";
import { RequestParser } from "./RequestParser";

import { mimeType } from "../utils/mimeTypes";

import serveStaticFilesHandler from "../handlers/serveStaticFilesHandler";
import handleNotFound from "../handlers/notFoundHandler";

export class RequestProcessor {
  constructor(
    private routeHandler: RouteHandler,
    private middlewareManager: MiddlewareManager
  ) {}

  public processRequest(parser: RequestParser, socket: Socket) {
    const { pathname, method, extension } = parser.getRequestLine();

    const route = this.routeHandler.findRoute(method, pathname);
    const response = new HTTPResponse(socket);

    if (route) {
      const headers = parser.getRequestHeaders();
      const body = parser.getRequestBody();

      const request: Request = {
        pathname,
        method,
        extension,
        headers,
        body,
        params: {},
      };

      this.middlewareManager.callMiddlewares(request, response);

      request.params = route.params;
      return route.handler(request, response);
    }

    if (extension && mimeType[extension as keyof typeof mimeType]) {
      const headers = parser.getRequestHeaders();

      const request: RequestStaticFiles = {
        pathname,
        method,
        extension,
        headers,
      };
      return serveStaticFilesHandler(request, response);
    }

    handleNotFound(response);
  }
}

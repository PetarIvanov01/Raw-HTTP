import type { Request, RequestStaticFiles, Socket } from "../../types.js";

import { RouteHandler } from "./RouteHandler.js";
import { MiddlewareManager } from "./MiddlewareManager.js";
import { HTTPResponse } from "./HTTPResponse.js";
import { RequestParser } from "./RequestParser.js";

import { mimeType } from "./constants.js";

import serveStaticFilesHandler from "../../handlers/static/serveStaticFilesHandler.js";
import handleNotFound from "../../handlers/static/notFoundHandler.js";

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

import type {
  HttpHandler,
  Request,
  RequestStaticFiles,
  Socket,
} from "../../types.js";
import { RequestHeadersError, RequestLineError } from "./Errors.js";

import { RouteHandler } from "./RouteHandler.js";
import { MiddlewareManager } from "./MiddlewareManager.js";
import { HTTPResponse } from "./HTTPResponse.js";
import { RequestParser } from "./RequestParser.js";

import { mimeType } from "./constants.js";

import serveStaticFilesHandler from "../../handlers/static/serveStaticFilesHandler.js";
import handleNotFound from "../../handlers/static/notFoundHandler.js";
import defaultErrorHandler from "../lib/defaultErrorHandler.js";

export class RequestProcessor {
  constructor(
    private routeHandler: RouteHandler,
    private middlewareManager: MiddlewareManager
  ) {}

  public processRequest(parser: RequestParser, socket: Socket) {
    const response = new HTTPResponse(socket);

    try {
      const { pathname, method, extension } = parser.getRequestLine();

      const route = this.routeHandler.findRoute(method, pathname);

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

      const middlewares = this.middlewareManager.getMiddlewares();

      if (route) {
        request.params = route.params;
        this.runHandlers(request, response, [
          ...middlewares,
          ...route.handlers,
        ]);
        return;
      }

      if (extension && mimeType[extension as keyof typeof mimeType]) {
        const request: RequestStaticFiles = {
          pathname,
          method,
          extension,
          headers,
        };
        return serveStaticFilesHandler(request, response);
      }

      handleNotFound(response);
    } catch (error) {
      if (error instanceof RequestLineError) {
        return response.status(error.status).end();
      } else if (error instanceof RequestHeadersError) {
        return response.status(error.status).end();
      }
      return response.status(500).end();
    }
  }

  private async runHandlers(
    req: Request,
    res: HTTPResponse,
    handlers: HttpHandler[]
  ) {
    let index = 0;
    const promises: Promise<void>[] = [];

    const next = async (err?: unknown) => {
      if (err) {
        return defaultErrorHandler(err, req, res, next);
      }

      if (index < handlers.length) {
        const handler = handlers[index++];

        let result;
        try {
          result = handler(req, res, next);
        } catch (error) {
          return defaultErrorHandler(error, req, res, next);
        }
        if (
          handler.constructor.name === "AsyncFunction" ||
          res instanceof Promise
        ) {
          promises.push(result as Promise<void>);
        }
      }
    };

    try {
      await next();
    } catch (error) {
      return defaultErrorHandler(error, req, res, next);
    }

    for (const promise of promises) {
      try {
        await promise;
      } catch (error) {
        return defaultErrorHandler(error, req, res, next);
      }
    }
  }
}

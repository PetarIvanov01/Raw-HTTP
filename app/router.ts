import net from "net";

import { mimeType } from "./utils/parsers";
import { Request } from "./types";

import serveStaticFilesHandler from "./handlers/serveStaticFilesHandler";
import handleNotFound from "./handlers/notFoundHandler";

type HttpHandler = (req: Request, socket: net.Socket) => void;

export default class Router {
  private static instance: Router;

  public static getInstance() {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  private constructor() {}

  private routes: {
    [key: string]: {
      [method: string]: { params: string[]; handler: HttpHandler };
    };
  } = {};

  public get(path: string, handler: HttpHandler) {
    // Logic for adding the proper path
    // What if i got the path /echo/:name
    // I will know that the /:name will be any string
    // So I have to parse the path and add it to the addRouter
    this.addRoute("GET", path, handler);
    // Take the necessary infromation from the request
    // Get the wanted infomration fro the server - It can be /html/text/css/ect.
    // Creating the Response and retrieve the information
  }

  public post(path: string, handler: HttpHandler) {
    // The same is for here
    this.addRoute("POST", path, handler);
    // Take the necessary infromation from the request
    // Write the information into a mock database /maybe a CSV or plain text/
    // Creating the Response and retrieve it
  }

  public handleRequest(req: Request, socket: net.Socket) {
    const { pathname, method, extension } = req;

    if (extension && mimeType[extension as keyof typeof mimeType]) {
      return serveStaticFilesHandler(req, socket);
    }

    for (const normalizedPath in this.routes) {
      const { handler, params } = this.routes[normalizedPath][method] || {};
      const match = this.matchPath(normalizedPath, pathname, params);

      if (match) {
        req.params = match.params;
        return handler(req, socket);
      }
    }

    handleNotFound(socket);
  }

  private addRoute(method: "GET" | "POST", path: string, handler: HttpHandler) {
    const { normalizedPath, paramNames } = this.parsePath(path);

    if (!this.routes[normalizedPath]) {
      this.routes[normalizedPath] = {};
    }
    this.routes[normalizedPath][method] = { handler, params: paramNames };
  }

  private parsePath(path: string) {
    const paramNames: string[] = [];
    const normalizedPath = path.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    });
    return { normalizedPath, paramNames };
  }

  private matchPath(
    normalizedPath: string,
    pathname: string,
    paramNames?: string[]
  ) {
    const regex = new RegExp(`^${normalizedPath}$`);
    const match = pathname.match(regex);
    if (!match) {
      return null;
    }
    const params: { [key: string]: string } = {};

    if (paramNames) {
      paramNames.forEach((paramName, index) => {
        params[paramName] = match[index + 1];
      });
    }
    return { params };
  }
}

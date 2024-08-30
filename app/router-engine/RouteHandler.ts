import type { HttpHandler } from "../types.d.js";

export class RouteHandler {
  private routes: {
    [key: string]: {
      [method: string]: { paramNames: string[]; handler: HttpHandler };
    };
  } = {};

  public addRoute(method: "GET" | "POST", path: string, handler: HttpHandler) {
    const { normalizedPath, paramNames } = parsePath(path);
    if (!this.routes[normalizedPath]) {
      this.routes[normalizedPath] = {};
    }
    this.routes[normalizedPath][method] = { handler, paramNames };
  }

  public findRoute(method: string, pathname: string) {
    for (const normalizedPath in this.routes) {
      const { handler, paramNames } = this.routes[normalizedPath][method] || {};
      const match = matchPath(normalizedPath, pathname);
      if (match) {
        const params = getParams(match, paramNames);
        return { handler, params };
      }
    }
    return null;
  }
}

function parsePath(path: string) {
  const paramNames: string[] = [];
  const normalizedPath = path.replace(/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });
  return { normalizedPath, paramNames };
}

function matchPath(normalizedPath: string, pathname: string) {
  const regex = new RegExp(`^${normalizedPath}$`);
  return pathname.match(regex);
}

function getParams(match: RegExpMatchArray, paramNames: string[]) {
  const params: { [key: string]: string } = {};
  paramNames.forEach((paramName, index) => {
    params[paramName] = match[index + 1];
  });
  return params;
}

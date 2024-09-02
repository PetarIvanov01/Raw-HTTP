import type { RequestHeadersOptions, RequestLineOptions } from "../../types.js";
import { mimeType } from "./constants.js";

export class RequestParser {
  private rawRequest: string;

  private requestLine: string;
  private headersString: string[];
  private body: string;

  constructor(data: Buffer) {
    this.rawRequest = data.toString("ascii");

    const [head, body] = this.rawRequest.split("\r\n\r\n");
    const [requestLine, ...ls] = head.split("\r\n");

    this.requestLine = requestLine;
    this.headersString = ls;
    this.body = body;
  }

  public getRequestLine(): RequestLineOptions {
    const [method, pathname] = this.requestLine.split(" ");

    const regexForExtension = new RegExp(/(?<ext>\.[\w]+)$/);
    let group = pathname.match(regexForExtension)?.groups;

    let extension = group?.ext;

    // TODO - Refactor this because it's look awful
    if (extension && extension === ".gz") {
      const originalPath = pathname.substring(0, pathname.length - 1 - 2);
      extension = originalPath.match(regexForExtension)?.groups?.ext;
    }

    if (!mimeType[extension as keyof typeof mimeType]) {
      extension = undefined;
    }

    return {
      method,
      pathname,
      extension,
    };
  }

  public getRequestHeaders(): RequestHeadersOptions {
    const headers = this.headersString
      .map((e) => {
        return e.split(": ");
      })
      .reduce(
        (hs, [key, value]) =>
          Object.defineProperty(hs, key.toLowerCase(), {
            enumerable: true,
            value,
            writable: false,
          }),
        {}
      ) as RequestHeadersOptions;

    return headers;
  }

  public getRequestBody() {
    return this.body;
  }
}

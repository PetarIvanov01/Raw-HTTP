import { RequestHeadersError, RequestLineError } from "./Errors.js";
import type { RequestHeadersOptions, RequestLineOptions } from "../../types.js";
import {
  mimeType,
  METHODS,
  MAX_REQUEST_TARGET_LENGTH,
  HOST_PATTERN,
} from "./constants.js";

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
    const requestLineParts = this.requestLine.split(" ");

    if (requestLineParts.length !== 3) {
      throw new RequestLineError(400);
    }

    const [method, pathname, httpVersion] = requestLineParts;

    if (METHODS.indexOf(method) === -1) {
      throw new RequestLineError(501);
    }

    if (pathname.length > MAX_REQUEST_TARGET_LENGTH) {
      throw new RequestLineError(414);
    }

    if (/\s/.test(pathname)) {
      throw new RequestLineError(400);
    }

    if (httpVersion !== "HTTP/1.1") {
      throw new RequestLineError(505);
    }

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
    const hostHeaders = this.headersString.filter((e) =>
      e.toLowerCase().startsWith("host:")
    );
    console.log("HOSTS: ", hostHeaders);

    if (hostHeaders.length > 1) {
      throw new RequestHeadersError(400);
    }

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

    if (!headers.host || !HOST_PATTERN.test(headers.host)) {
      throw new RequestHeadersError(400);
    }

    return headers;
  }

  public getRequestBody() {
    return this.body;
  }
}

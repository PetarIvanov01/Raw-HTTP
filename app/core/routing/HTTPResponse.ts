import type { RequestHeadersOptions, Socket } from "../../types.js";

import { statusMessages } from "./constants.js";

type Headers = Record<string, string | number>;
type KeyOfHeaders = keyof Headers;

export class HTTPResponse {
  private socket: Socket;
  private headersSent: boolean = false;
  private statusCode: number = 200;
  private headers: Headers = {};

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public set(headers: Headers): this;
  public set(key: KeyOfHeaders, value: string): this;

  public set(keyOrHeaders: Headers | KeyOfHeaders, value?: string): this {
    if (typeof keyOrHeaders === "string") {
      const key = keyOrHeaders.toLowerCase();
      if (value) {
        this.headers[key] = value;
      }
    } else {
      for (const [key, val] of Object.entries(keyOrHeaders)) {
        this.headers[key.toLowerCase()] = val;
      }
    }

    return this;
  }

  public status(code: number) {
    this.statusCode = code;
    return this;
  }

  private writeHead() {
    if (!this.headersSent) {
      const responseHeaders = createResponse({
        statusCode: this.statusCode,
        headers: this.headers,
      });

      this.socket.write(responseHeaders);
      this.headersSent = true;
    }
  }

  public write(data: Buffer | string) {
    this.writeHead();
    this.socket.write(data);
  }

  public end(data?: Buffer | string) {
    if (data) {
      this.write(data);
    }
    this.socket.end(() => {
      console.log(
        `[INFO] Response sent successfully. Socket closed for ${this.socket.remoteAddress}:${this.socket.remotePort}`
      );
    });
  }

  public send(data: Buffer | string) {
    this.writeHead();
    this.socket.end(data);
  }
}

function normalizeHeaderKey(key: keyof RequestHeadersOptions) {
  return key.replace(/(?<=^|-)[a-z]/g, (x: string) => x.toUpperCase());
}

function stringifyHeaders(headers: Partial<RequestHeadersOptions>) {
  return Object.entries(headers).reduce(
    (hd, [key, val]) =>
      `${hd}\r\n${normalizeHeaderKey(
        key as keyof RequestHeadersOptions
      )}: ${val}`,
    ""
  );
}

function createResponse({ headers, statusCode, body }: IHTTPResponse) {
  return `HTTP/1.1 ${statusCode} ${
    statusMessages[statusCode]
  }${stringifyHeaders(headers || {})}\r\n\r\n${body || ""}`;
}

interface IHTTPResponse {
  statusCode: number;
  headers?: Partial<RequestHeadersOptions>;
  body?: any;
}

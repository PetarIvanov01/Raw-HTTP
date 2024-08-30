import { Socket } from "../types";
import createResponse from "../utils/createHttpResponse";

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
      console.log("Response is sent and socket is closed");
    });
  }

  public send(data: Buffer | string) {
    this.writeHead();
    this.socket.end(data);
  }
}

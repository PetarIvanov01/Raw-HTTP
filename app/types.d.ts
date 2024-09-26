import Router from "./core/routing/index.ts";
import { HTTPResponse } from "./core/routing/HTTPResponse.ts";
import * as net from "net";

export interface RequestLineOptions {
  method: string;
  pathname: string;
  extension?: string;
}

export interface RequestHeadersOptions {
  host: string;
  "user-agent": string;
  accept: string;
  "content-type"?: string;
  "content-length"?: number;
  "content-encoding"?: string;
  connection?: string;
  "accept-encoding"?: string;
  "if-modified-since"?: string;
}

export interface Request extends RequestLineOptions {
  headers: RequestHeadersOptions;
  params: { [key: string]: string | undefined };
  body: any;
}

export interface RequestStaticFiles extends RequestLineOptions {
  headers: RequestHeadersOptions;
}

export type NextFunction = (err?: unknown) => void;
export type Socket = net.Socket;

export type HttpHandler = (
  req: Request,
  res: Response,
  next: (err?) => void
) => Promise<void> | void;

export type Router = Router;
export type Response = HTTPResponse;

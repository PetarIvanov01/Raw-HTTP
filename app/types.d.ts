import HTTPResponse from "./router-engine/HTTPResponse";
import { Socket } from "net";

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
}

export interface Request extends RequestLineOptions {
  headers: RequestHeadersOptions;
  params: { [key: string]: string | undefined };
  body: any;
}

export interface RequestStaticFiles extends RequestLineOptions {
  headers: RequestHeadersOptions;
}

export type Socket = Socket;

export type HttpHandler = (req: Request, res: Response) => void;

export interface HTTPResponse {
  statusCode: number;
  headers?: Partial<RequestHeadersOptions>;
  body?: any;
}

export type Response = HTTPResponse;

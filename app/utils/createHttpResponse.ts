import { RequestHeadersOptions, HTTPResponse } from "../types";

const statusMessages: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Error",
};

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

export default function createResponse({
  headers,
  statusCode,
  body,
}: HTTPResponse) {
  return `HTTP/1.1 ${statusMessages[statusCode]}${stringifyHeaders(
    headers || {}
  )}\r\n\r\n${body || ""}`;
}

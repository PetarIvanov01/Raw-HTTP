import { compressGzyp } from "./compr";

import {
  RequestBody,
  RequestHeadersOptions,
  RequestLineOptions,
} from "../types";

export function parseRequestLine(requestData: string): RequestLineOptions {
  const method = requestData.substring(0, 4).trim();

  const regex = new RegExp(/\s+([^\s]+)\s+/);
  const pathnameMatch = requestData.split("\r\n")[0].match(regex);

  if (!pathnameMatch) {
    throw new Error("Invalid pathname");
  }

  return {
    method,
    pathname: pathnameMatch[1],
  };
}

export function parseRequestHeaders(
  requestData: string
): RequestHeadersOptions {
  const VALID_ENCODINGS = ["gzip"];

  const partsOfRequestData = requestData.split("\r\n");

  const headersEndsIndex = partsOfRequestData.indexOf("");
  const requestHeaders = partsOfRequestData.slice(1, headersEndsIndex);

  const headersMap = new Map<string, string>();

  for (const line of requestHeaders) {
    const [headerName, ...headerValue] = line.split(":");
    const normalizedHeaderName = headerName.trim().toLowerCase();
    headersMap.set(normalizedHeaderName, headerValue.join(":").trim());
  }

  const host = headersMap.get("host");
  const userAgent = headersMap.get("user-agent");
  const accept = headersMap.get("accept");

  const encodings = headersMap.get("accept-encoding")?.split(", ");
  if (encodings) {
    for (const e of encodings) {
      if (VALID_ENCODINGS.includes(e.trim())) {
        headersMap.set("accept-encoding", e);
        break;
      }
      headersMap.delete("accept-encoding");
    }
  }

  if (!host || !userAgent || !accept) {
    throw new Error("Invalid request headers");
  }

  return {
    host,
    userAgent,
    accept,
    contentType: headersMap.get("content-type"),
    contentLength: headersMap.get("content-length")
      ? Number(headersMap.get("content-length"))
      : undefined,
    contentEncoding: headersMap.get("accept-encoding"),
  };
}

export function parseRequestBody(
  requestData: string,
  headers: RequestHeadersOptions
): RequestBody {
  const partsOfRequestData = requestData.split("\r\n");
  const headersEndsIndex = partsOfRequestData.indexOf("");

  const encoding = headers.contentEncoding;
  let requestBody: string | Buffer =
    partsOfRequestData.slice(headersEndsIndex)[1];

  if (encoding && encoding === "gzip") {
    requestBody = compressGzyp(requestBody);
    headers.contentLength = requestBody.length;
  }

  return {
    body: requestBody,
  };
}

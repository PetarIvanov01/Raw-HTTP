import net from "net";
import path from "path";
import zlib from "zlib";
import url from "url";
import fs from "fs/promises";

interface RequestLineOptions {
  method: string;
  pathname: string;
}

interface RequestHeadersOptions {
  host: string;
  userAgent: string;
  accept: string;
  contentType?: string;
  contentLength?: number;
  contentEncoding?: string;
}

interface RequestBody {
  body: any;
}

interface Request
  extends RequestLineOptions,
    RequestHeadersOptions,
    RequestBody {
  rawData: string;
}

console.log("------------");

const server = net.createServer((socket) => {
  console.log("Connected");

  socket.on("data", (data) => {
    try {
      const rawData = data.toString("ascii");

      const { method, pathname } = parseRequestLine(rawData);
      const headers = parseRequestHeaders(rawData);
      const body = parseRequestBody(rawData, headers);

      const request: Request = {
        rawData: rawData,
        method,
        pathname,
        ...headers,
        ...body,
      };

      if (method === "GET") {
        if (pathname === "/" || pathname === "/index.html") {
          handleOKResponse(socket, request);
        } else if (pathname.startsWith("/echo")) {
          handleTextResponse(socket, request);
        } else if (pathname === "/user-agent") {
          handleUserAgent(socket, request);
        } else if (pathname.startsWith("/files")) {
          handleGetFileContent(socket, request);
        } else {
          handleNotFound(socket);
        }
      } else {
        if (pathname.startsWith("/files")) {
          handleCreateFileWithContent(socket, request);
        } else {
          handleNotFound(socket);
        }
      }
    } catch (error) {
      handleNotFound(socket);
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

// - GET Handlers
function handleOKResponse(socket: net.Socket, req: Request) {
  const { pathname, host } = req;

  const parsedUrl = url.format({
    protocol: "http",
    pathname,
    host,
  });

  const response = createResponse(200, {
    contentType: "text/plain",
    contentLength: parsedUrl.length,
    responseData: parsedUrl,
  });

  socket.write(response);
  socket.end(() => {
    console.log("Response is send: ", response.toString());
    console.log("Request is valid, URL Path -> ", parsedUrl);
  });
}

function handleTextResponse(socket: net.Socket, req: Request) {
  const { pathname } = req;

  const pathnameParts = pathname.split("/");
  const lastPartPathname = pathnameParts[pathnameParts.length - 1];

  zlib.gzip(lastPartPathname, (err, compressedData) => {
    if (err) {
      console.error("Error compressing data:", err);
      handleNotFound(socket);
      return;
    }

    const response = createResponse(200, {
      contentType: "application/octet-stream",
      contentLength: compressedData.byteLength,
      responseData: compressedData.toString("binary"),
      contentEncoding: "gzip",
    });

    socket.write(response);
    socket.end(() => {
      console.log("Response sent with compressed data:", compressedData);
    });
  });
}

function handleUserAgent(socket: net.Socket, req: Request) {
  try {
    const { userAgent } = req;

    const response = createResponse(200, {
      contentType: "text/plain",
      contentLength: userAgent.length,
      responseData: userAgent,
    });

    socket.write(response);
    socket.end(() => {
      console.log("Response is send: ", response.toString());
    });
  } catch (error) {
    socket.end("HTTP/1.1 404 Not Found\r\n\r\n");
    return;
  }
}

async function handleGetFileContent(socket: net.Socket, req: Request) {
  const { pathname } = req;
  const lastPartOfPathname = pathname.split("/files")[1];

  const dirPath = path.join(__dirname, "../", "/public");
  const files = await fs.readdir(dirPath);

  if (!files.some((f) => `/${f}` === lastPartOfPathname)) {
    socket.end(createResponse(404));
    return;
  }

  const filePath = path.join(__dirname, "../", "/public", lastPartOfPathname);
  const fileInBytes = await fs.readFile(filePath);

  const response = createResponse(200, {
    contentType: "application/octet-stream",
    contentLength: fileInBytes.byteLength,
    responseData: fileInBytes.toString("binary"),
  });

  socket.write(response);
  socket.end(() => {
    console.log("Response is send: ", response.toString());
  });
}

// - POST Handlers
async function handleCreateFileWithContent(socket: net.Socket, req: Request) {
  const { body, pathname } = req;

  const lastPartOfPathname = pathname.split("/files")[1];
  const filePath = path.join(__dirname, "../", "/public", lastPartOfPathname);

  await fs.writeFile(filePath, body, { flag: "w+" });

  const response = createResponse(201);

  socket.write(response);
  socket.end(() => {
    console.log("Response is send: ", response.toString());
  });
}

// - Error Handlers
function handleNotFound(socket: net.Socket) {
  const response = Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n");
  socket.write(response);
  socket.end(() => {
    console.log("Request is invalid - resource not found");
  });
}

// * Utils
function parseRequestLine(requestData: string): RequestLineOptions {
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

function parseRequestHeaders(requestData: string): RequestHeadersOptions {
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

function parseRequestBody(
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

function createResponse(
  statusNumber: number,
  options?: {
    contentType?: string;
    contentLength?: number;
    responseData?: string | Buffer;
    contentEncoding?: string;
  }
) {
  const statusMessages: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
  };

  let response = `HTTP/1.1 ${statusNumber} ${statusMessages[statusNumber]}\r\n`;

  if (options) {
    const { contentType, contentLength, responseData, contentEncoding } =
      options;

    if (contentType) {
      response += `Content-Type: ${contentType}\r\n`;
    }
    console.log(options);

    if (contentLength !== undefined) {
      response += `Content-Length: ${contentLength}\r\n`;
    } else if (responseData) {
      response += `Content-Length: ${Buffer.byteLength(responseData)}\r\n`;
    }

    if (contentEncoding) {
      response += `Content-Encoding: ${contentEncoding}\r\n`;
    }

    response += "\r\n";

    if (responseData) {
      response += responseData;
    }
  } else {
    response += "\r\n";
  }

  return response;
}

function compressGzyp(str: string) {
  return zlib.gzipSync(str);
}

import net from "net";
import path from "path";
import url from "url";
import fs from "fs/promises";
import zlib from "zlib";

import { Request } from "./types";

import createResponse from "./utils/createHttpResponse";

import {
  parseRequestBody,
  parseRequestHeaders,
  parseRequestLine,
} from "./utils/parsers";

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

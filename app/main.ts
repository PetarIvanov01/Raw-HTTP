import net from "net";

import { Request } from "./types";

import {
  parseRequestBody,
  parseRequestHeaders,
  parseRequestLine,
} from "./utils/parsers";

import Router from "./router";
import "./routes/index";

import handleNotFound from "./handlers/notFoundHandler";

console.log("------------ Project start ------------");

const router = Router.getInstance();

const server = net.createServer((socket) => {
  console.log("Connected");

  socket.on("data", (data) => {
    try {
      const rawData = data.toString("ascii");

      const requestLine = parseRequestLine(rawData);
      const headers = parseRequestHeaders(rawData, requestLine.extension);
      const body = parseRequestBody(rawData, headers);

      const request: Request = {
        ...requestLine,
        ...headers,
        ...body,
        params: {},
      };

      router.handleRequest(request, socket);
    } catch (error) {
      handleNotFound(socket);
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

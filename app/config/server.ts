import * as net from "net";
import { Router } from "../types.js";
import { RequestParser } from "../core/routing/index.js";

export default function createServer(router: Router) {
  return net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    // console.log(`[INFO] New connection established from ${clientAddress}`);

    socket.on("data", (data) => {
      // console.log(`[INFO] Received data from ${clientAddress}:`);
      const parser = new RequestParser(data);
      router.dispatchIncomingRequest(parser, socket);
      // console.log(`[INFO] Dispatched request from ${clientAddress} to router`);
    });

    socket.on("close", () => {
      // console.log(`[INFO] Connection closed with ${clientAddress}`);
      socket.end();
    });

    socket.on("error", (err) => {
      console.error(`[ERROR] An error occurred with ${clientAddress}:`, err);
      socket.end(
        `HTTP/1.1 500 Internal Server Error\r\n\ ${JSON.stringify(err)}\r\n`
      );
    });
  });
}

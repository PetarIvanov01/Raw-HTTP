import * as net from "net";

import Router, { RequestParser } from "./router-engine/index.js";
import "./database/index.js";
import "./routes/index.js";

const router = Router.getInstance();

const server = net.createServer((socket) => {
  console.log("Connected");

  socket.on("data", (data) => {
    const parser = new RequestParser(data);
    router.dispatchIncomingRequest(parser, socket);
  });

  socket.on("close", () => {
    socket.end();
  });

  socket.on("error", (err) => {
    socket.end(
      `HTTP/1.1 500 Internal Server Error\r\n\ ${JSON.stringify(err)}\r\n`
    );
  });
});
server.listen(4221, "localhost", () => {
  console.log("Server is listening on port:", 4221);
});

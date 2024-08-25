import { Socket } from "../types";

export default function handleNotFound(socket: Socket) {
  const response = Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n");
  socket.write(response);
  socket.end(() => {
    console.log("Request is invalid - resource not found");
  });
}

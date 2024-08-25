import zlib from "zlib";
import { Socket, Request } from "../types";
import createResponse from "../utils/createHttpResponse";

export default function handleTextResponse(req: Request, socket: Socket) {
  const { params } = req;
  const echoString = params.echo;

  if (!echoString) {
    const response = createResponse(404);
    socket.write(response);
    socket.end();
    return;
  }

  const normalizeParams = decodeURIComponent(echoString);

  zlib.gzip(normalizeParams, (err, compressed) => {
    if (err) {
      console.error("Gzip compression error:", err);
      const response = createResponse(500);
      socket.write(response);
      socket.end();
      return;
    }

    const response = createResponse(200, {
      contentType: "text/plain",
      contentEncoding: "gzip",
      contentLength: compressed.byteLength,
    });

    socket.write(response);
    socket.write(compressed);

    socket.end(() => {
      console.log("Response sent with compressed data:", compressed);
    });
  });
}

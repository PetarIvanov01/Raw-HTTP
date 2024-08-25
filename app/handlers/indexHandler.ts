import path from "path";
import { Socket, Request } from "../types";
import createResponse from "../utils/createHttpResponse";
import fs from "fs/promises";

export default async function handleIndex(req: Request, socket: Socket) {
  const { connection, staticPath } = req;

  if (!staticPath) {
    return createResponse(404);
  }

  const filePath = path.join(staticPath, "index.html");
  const file = await fs.readFile(filePath);

  if (!file) {
    return createResponse(404);
  }
  const response = createResponse(200, {
    contentType: "text/html",
    connection,
  });

  socket.write(response);
  socket.write(file);

  socket.end(() => {
    console.log("Response is send: ", response.toString());
  });
}

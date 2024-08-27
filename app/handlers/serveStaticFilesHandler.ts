import fs from "fs/promises";
import path from "path";

import { RequestStaticFiles, Socket } from "../types";

import createResponse from "../utils/createHttpResponse";
import compressStaticFiles from "../utils/compr";
import { mimeType } from "../utils/mimeTypes";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export default async function serveStaticFilesHandler(
  req: RequestStaticFiles,
  socket: Socket
) {
  const pathname = req.pathname;
  const ext = req.extension;

  if (!ext) {
    return socket.end(createResponse(404));
  }
  const filePath = path.join(STATIC_PATH_DIR, pathname);

  try {
    await fs.access(filePath);
  } catch (error) {
    return socket.end(createResponse(404));
  }

  try {
    let file = await fs.readFile(filePath);

    try {
      if (!pathname.endsWith(".gz")) {
        file = await compressStaticFiles(file);
      }

      const contentType = mimeType[ext as keyof typeof mimeType];
      const response = createResponse(200, {
        contentEncoding: "gzip",
        contentType,
        contentLength: file.byteLength,
      });

      socket.write(response);
      socket.write(file);
      socket.end();
    } catch (error) {
      console.error("Gzip compression error:", error);
      const response = createResponse(500);
      socket.end(response);
      return;
    }
  } catch (error) {
    socket.end(createResponse(400));
  }
}

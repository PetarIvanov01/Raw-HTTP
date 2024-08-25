import zlib from "zlib";
import fs from "fs/promises";

import { Request, Socket } from "../types";

import createResponse from "../utils/createHttpResponse";
import path from "path";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export default async function serveStaticFilesHandler(
  req: Request,
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

      const response = createResponse(200, {
        contentEncoding: "gzip",
        contentType: req.contentType,
        contentLength: file.byteLength,
      });

      socket.write(response);
      socket.write(file);
      socket.end();
    } catch (error) {
      console.error("Gzip compression error:", error);
      const response = createResponse(500);
      socket.write(response);
      socket.end();
      return;
    }
  } catch (error) {
    socket.end(createResponse(400));
  }
}

function compressStaticFiles(file: Buffer): Promise<Buffer> {
  const promise = new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(file, (err, compressed) => {
      if (err) {
        reject(err);
      }
      resolve(compressed);
    });
  });

  return promise;
}

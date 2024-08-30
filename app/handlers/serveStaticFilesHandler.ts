import * as fs from "fs/promises";
import * as path from "path";

import type { RequestStaticFiles, Response } from "../types.js";

import { mimeType } from "../utils/mimeTypes.js";
import compressStaticFiles from "../utils/compr.js";
import handleNotFound from "./notFoundHandler.js";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export default async function serveStaticFilesHandler(
  req: RequestStaticFiles,
  res: Response
) {
  const pathname = req.pathname;
  const ext = req.extension;

  if (!ext) {
    return handleNotFound(res);
  }
  const filePath = path.join(STATIC_PATH_DIR, pathname);

  try {
    await fs.access(filePath);
  } catch (error) {
    return handleNotFound(res);
  }

  try {
    let file = await fs.readFile(filePath);

    try {
      if (!pathname.endsWith(".gz")) {
        file = await compressStaticFiles(file);
      }
      const contentType = mimeType[ext as keyof typeof mimeType];

      res
        .status(200)
        .set({
          "Content-Type": contentType,
          "Content-Encoding": "gzip",
          "Content-Length": file.byteLength,
        })
        .send(file);
    } catch (error) {
      console.error("Gzip compression error:", error);
      res.status(500).end();
      return;
    }
  } catch (error) {
    res.status(400).end();
  }
}

import type { RequestStaticFiles, Response } from "../../types.js";

import { mimeType } from "../../core/routing/constants.js";
import { readFileFromPublic } from "../../helpers/fileHelpers.js";

import handleNotFound from "./notFoundHandler.js";

export default async function serveStaticFilesHandler(
  req: RequestStaticFiles,
  res: Response
) {
  const pathname = req.pathname;
  const ext = req.extension;

  if (!ext) {
    return handleNotFound(res);
  }

  const file = await readFileFromPublic(pathname, ext);

  if (!file) {
    return handleNotFound(res);
  }

  try {
    const contentType =
      mimeType[ext as keyof typeof mimeType] || "application/octet-stream";

    res
      .status(200)
      .set({
        "Content-Type": contentType,
        "Content-Encoding": "gzip",
        "Content-Length": file.byteLength,
        "Cache-Control": "max-age=31536000, immutable",
      })
      .send(file);
  } catch (error) {
    console.error(`[ERROR] Failed to serve file: ${pathname}`, error);
    return res.status(500).end("Server error while processing data");
  }
}

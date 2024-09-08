import type { Request, Response } from "../../types.js";
import { getFileStat, readFileFromPublic } from "../../helpers/fileHelpers.js";

import handleNotFound from "./notFoundHandler.js";

export default async function homePageHandler(req: Request, res: Response) {
  try {
    const indexFilePath = "index.html.gz";
    const file = await readFileFromPublic(indexFilePath, "gz");

    if (!file) {
      return handleNotFound(res);
    }

    const stats = await getFileStat(indexFilePath);

    if (!stats) {
      return handleNotFound(res);
    }

    const lastModified = stats.mtime.toUTCString();
    const ifModifiedSince = req.headers["if-modified-since"];

    if (ifModifiedSince) {
      const clientModifiedDate = new Date(ifModifiedSince);

      const serverModifiedDate = new Date(stats.mtime);
      serverModifiedDate.setMilliseconds(0);

      if (clientModifiedDate >= serverModifiedDate) {
        return res.status(304).end("");
      }
    }
    res
      .status(200)
      .set({
        "Content-Type": "text/html",
        "Content-Length": file.byteLength,
        "Content-Encoding": "gzip",
        "Cache-Control": "no-cache, must-revalidate",
        "Last-Modified": lastModified,
      })
      .send(file);
  } catch (error) {
    return res.status(500).end();
  }
}

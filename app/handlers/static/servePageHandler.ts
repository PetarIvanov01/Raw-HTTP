import type { Request, Response } from "../../types.js";
import { readFileFromPublic } from "../../helpers/fileHelpers.js";

import handleNotFound from "./notFoundHandler.js";

export default async function homePageHandler(req: Request, res: Response) {
  try {
    const file = await readFileFromPublic("index.html.gz", "gz");

    if (!file) {
      return handleNotFound(res);
    }

    res
      .status(200)
      .set({
        "Content-Type": "text/html",
        "Content-Length": file.byteLength,
        "Content-Encoding": "gzip",
      })
      .send(file);
  } catch (error) {
    return res.status(500).end();
  }
}

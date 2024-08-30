import path from "path";
import fs from "fs/promises";

import { Request, Response } from "../types";
import compressStaticFiles from "../utils/compr";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export default async function handleIndex(req: Request, res: Response) {
  const filePath = path.join(STATIC_PATH_DIR, "index.html");
  const file = await fs.readFile(filePath);

  if (!file) {
    res.status(400).end();
    return;
  }
  const body = await compressStaticFiles(file);

  res
    .status(200)
    .set({
      "Content-Type": "text/html",
      "Content-Length": body.byteLength,
      "Content-Encoding": "gzip",
    })
    .send(body);
}

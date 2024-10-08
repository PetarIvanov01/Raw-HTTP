import * as path from "path";
import * as fs from "fs/promises";
import type { Response } from "../../types.d.js";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export default async function handleNotFound(res: Response) {
  const pagePath = path.join(STATIC_PATH_DIR, "pages", "404.html");

  try {
    await fs.access(pagePath);
  } catch {
    return res.status(404).end();
  }
  const file = await fs.readFile(pagePath);

  res
    .status(404)
    .set({
      "Content-Type": "text/html",
      "Content-Length": file.byteLength,
    })
    .end(file);
  return;
}

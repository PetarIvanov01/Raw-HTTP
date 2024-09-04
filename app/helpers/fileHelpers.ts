import * as path from "path";

import { customFileSystem as fs } from "../core/lib/fileSystem.js";
import compressStaticFiles from "../core/lib/compress.js";

const STATIC_PATH_DIR = path.join(process.cwd(), "public", "dist");

export async function readFileFromPublic(
  fileName: string,
  ext: string
): Promise<Buffer | null> {
  try {
    let filePath = path.join(STATIC_PATH_DIR, fileName);

    if (!fileName.includes("index.html")) {
      filePath = path.join(STATIC_PATH_DIR, "assets");
      const files = await fs.readDir(filePath);

      const gzFilename = files.find((e) => e.endsWith("gz") && e.includes(ext));

      if (gzFilename) {
        return await fs.readFile(path.join(filePath, gzFilename));
      }

      filePath = path.join(STATIC_PATH_DIR, fileName);
    }

    const file = await fs.readFile(filePath);

    if (fileName.endsWith(".gz")) {
      return file;
    }

    return await compressStaticFiles(file);
  } catch (error) {
    console.error(`[ERROR] Failed to read file: ${fileName}`, error);
    return null;
  }
}

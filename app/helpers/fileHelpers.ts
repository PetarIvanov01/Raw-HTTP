import * as path from "path";

import { customFileSystem as fs } from "../core/lib/fileSystem.js";
import compressStaticFiles from "../core/lib/compress.js";

const STATIC_PATH_DIR = path.join(process.cwd(), "public");

export async function readFileFromPublic(
  fileName: string
): Promise<Buffer | null> {
  try {
    const filePath = path.join(STATIC_PATH_DIR, fileName);
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

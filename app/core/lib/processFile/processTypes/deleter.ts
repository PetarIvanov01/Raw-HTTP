import { customFileSystem as fs } from "../../fileSystem.js";
export const deleter = async (
  startOffset: number,
  filePath: string,
  chunkSize: number,
  callback: (line: string, start: number, end: number) => boolean
) => {};

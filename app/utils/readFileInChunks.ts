import { customFileSystem as fs } from "../lib/fileSystem.js";

export default function processFileInChunks(startOffset = 0) {
  return async (
    filePath: string,
    chunkSize: number,
    callback: (line: string, start: number, end: number) => boolean
  ): Promise<void> => {
    const fd = await fs.open(filePath, "r");

    // This offest should be at the end of the table header
    let offset = startOffset;
    let remainder = "";
    let currentByte = offset;
    // Debugging
    let iterations = 0;

    try {
      const buffer = Buffer.alloc(chunkSize);

      while (true) {
        iterations++;

        const { bytesRead } = await fd.read(buffer, 0, chunkSize, offset);

        if (bytesRead === 0) break;

        const chunk =
          remainder + buffer.subarray(0, bytesRead).toString("utf-8");

        const lastNewlineIndex = chunk.lastIndexOf("\n");

        if (lastNewlineIndex !== -1) {
          const lines = chunk.slice(0, lastNewlineIndex).split("\n");
          remainder = chunk.slice(lastNewlineIndex + 1);

          for (const line of lines) {
            const lineLength = Buffer.byteLength(line, "utf-8") + 1; // +1 for newline

            const lineStart = currentByte;
            const lineEnd = currentByte + lineLength;

            const done = callback(line, lineStart, lineEnd);
            if (done) {
              return;
            }
            currentByte = lineEnd;
          }
        } else {
          remainder = chunk;
        }

        offset += bytesRead;
      }

      if (remainder) {
        const lineStart = currentByte;
        const lineEnd = currentByte + Buffer.byteLength(remainder, "utf-8");
        callback(remainder, lineStart, lineEnd);
      }
    } finally {
      await fd.close();
    }
  };
}

import * as path from "path";
import { customFileSystem as fs } from "../../fileSystem.js";
import type { UpdaterCallback } from "../types.js";

const tempFilePath = path.join(process.cwd(), "database", "temp.csv");

export async function updater(
  filePath: string,
  callback: UpdaterCallback
): Promise<void> {
  const originalFd = await fs.open(filePath, "r");
  const tempFd = await fs.open(tempFilePath, "w+");

  const originalStream = originalFd.createReadStream();
  const tempStream = tempFd.createWriteStream();
  try {
    let remainder = "";

    for await (const chunk of originalStream) {
      const chunkStr = remainder + chunk.toString();
      const lines = chunkStr.split("\n");

      remainder = lines.pop() || "";

      for (const line of lines) {
        try {
          const updatedLine = callback(line);

          if (updatedLine !== null) {
            tempStream.write(updatedLine + "\n");
          } else {
            tempStream.write(line + "\n");
          }
        } catch (callbackError) {
          console.error(
            "Error in callback while processing line:",
            callbackError
          );
          throw new Error(`Error processing line: ${line}`);
        }
      }
    }

    if (remainder) {
      try {
        const updatedLine = callback(remainder);
        if (updatedLine !== null) {
          tempStream.write(updatedLine + "\n");
        } else {
          tempStream.write(remainder + "\n");
        }
      } catch (callbackError) {
        console.error("Error in callback for remainder:", callbackError);
        throw new Error(`Error processing remainder line: ${remainder}`);
      }
    }

    await new Promise((resolve, reject) => {
      tempStream.on("finish", resolve);
      tempStream.on("error", reject);
      tempStream.end();
    });

    await originalFd.close();
    await tempFd.close();

    await fs.rename(tempFilePath, filePath);
  } catch (err) {
    console.log("Error during file update process: ", err);
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      console.error(`Failed to remove temp file: ${tempFilePath}`, unlinkError);
    }
    throw err;
  } finally {
    if (originalFd) await originalFd.close();
    if (tempFd) await tempFd.close();
  }
}

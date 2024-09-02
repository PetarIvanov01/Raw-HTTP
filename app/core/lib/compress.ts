import * as zlib from "zlib";

export default function compressStaticFiles(file: Buffer): Promise<Buffer> {
  const promise = new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(file, (err, compressed) => {
      if (err) {
        reject(err);
      }
      resolve(compressed);
    });
  });

  return promise;
}

import zlib from "zlib";

export function compressGzyp(str: string) {
  return zlib.gzipSync(str);
}

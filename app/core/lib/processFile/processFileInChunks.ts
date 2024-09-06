import type {
  DeleterType,
  Operation,
  ReaderType,
  UpdaterType,
} from "./types.js";

import { reader } from "./processTypes/reader.js";
import { deleter } from "./processTypes/deleter.js";
import { updater } from "./processTypes/updater.js";

export function processFileInChunks(
  operation: "read",
  startOffset: number
): ReaderType;
export function processFileInChunks(
  operation: "update",
  startOffset: number
): UpdaterType;
export function processFileInChunks(
  operation: "delete",
  startOffset: number
): DeleterType;

export function processFileInChunks(
  operation: Operation,
  startOffset = 0
): ReaderType | UpdaterType | DeleterType {
  if (operation === "read") {
    return reader.bind(null, startOffset);
  } else if (operation === "update") {
    return updater;
  } else {
    return deleter.bind(null, startOffset);
  }
}

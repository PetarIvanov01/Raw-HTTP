import * as path from "path";
import { Database } from "./Database.js";
import { customFileSystem as fs } from "../lib/fileSystem.js";
let instanse: Database;

function init() {
  if (instanse) {
    return instanse;
  }
  const dbPath = path.join(process.cwd(), "database");
  instanse = new Database("my-db", dbPath, fs);

  return instanse;
}

export const db = init();

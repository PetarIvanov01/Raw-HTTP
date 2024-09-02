import * as path from "path";
import { Database } from "../core/database/Database.js";
import { customFileSystem as fs } from "../core/lib/fileSystem.js";

let instance: Database;

function initDatabase(): Database {
  if (instance) {
    console.log("[INFO] Returning existing database instance.");
    return instance;
  }

  const dbPath = path.join(process.cwd(), "database");
  instance = new Database("my-db", dbPath, fs);

  console.log("[INFO] Database is initialized");
  return instance;
}

export default initDatabase;

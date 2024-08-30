import * as path from "path";

import { Database } from "./Database.js";

const dbPath = path.join(process.cwd(), "database");
export const db = new Database("my-db", dbPath);

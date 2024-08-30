import path from "path";

import { Database } from "./Database";

const dbPath = path.join(process.cwd(), "database");
export const db = new Database("my-db", dbPath);

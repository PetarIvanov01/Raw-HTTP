import { db } from "./index.js";

// stage - start | in progress | completed
export const todosTable = db.createOrGetTable("todos", [
  "stage",
  "user",
  "title",
  "description",
  "createdAt",
]);

import { db } from "./index.js";

export const todosTable = db.createOrGetTable("todos", [
  "id",
  "user",
  "title",
  "description",
  "createdAt",
]);

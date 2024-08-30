import { db } from "./index";

export const todosTable = db.createOrGetTable("todos", [
  "id",
  "user",
  "title",
  "description",
  "createdAt",
]);

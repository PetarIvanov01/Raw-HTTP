import databaseRef from "../config/database.js";

// stage - start | in progress | completed
const db = databaseRef();

function getTodosTable() {
  return db.createOrGetTable("todos", [
    "stage",
    "user",
    "title",
    "description",
    "createdAt",
  ]);
}

export const todosTable = getTodosTable();

import { getFormatDate } from "./utils.js";
import { todosTable } from "../models/todosTable.js";

interface ITodoCreate {
  stage: "start" | "in progress" | "completed" | string;
  user: string;
  title: string;
  description: string;
  createdAt: string;
}

interface ITodo {
  title: string;
  description: string;
}

export async function createTodoService(todo: ITodo) {
  const payload: ITodoCreate = {
    ...todo,
    stage: "start",
    user: "default",
    createdAt: getFormatDate(),
  };

  await todosTable.createRow(payload);
}

export async function getTodosService() {
  const rows = await todosTable.fetchRows(7);
  return rows;
}

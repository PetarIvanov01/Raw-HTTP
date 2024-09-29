import { getFormatDate } from "./utils.js";
import { todosTable } from "../models/todosTable.js";

interface ITodoCreate {
  stage: "start" | "in progress" | "completed";
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
    createdAt: Date.now().toString(),
  };

  await todosTable.createRow(payload);
}

export async function getTodosService() {
  const rows = await todosTable.fetchRows(7);

  return rows
    .sort((a, b) => {
      if (Number(a.createdAt) - Number(b.createdAt) < Number(b.createdAt)) {
        return -1;
      }
      return 1;
    })
    .map((e) => {
      e.createdAt = getFormatDate(e.createdAt);
      return e;
    });
}

export async function editTodoService(id: string, todo: ITodo) {
  await todosTable.updateRow({ where: { id } }, todo);
}

import { todosTable } from "../database/tables.js";

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

function getFormatDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

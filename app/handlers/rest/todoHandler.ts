import type { Request, Response } from "../../types.js";
import {
  createTodoService,
  getTodosService,
  editTodoService,
} from "../../services/todoService.js";

export async function getTodosHandler(req: Request, res: Response) {
  const todos = await getTodosService();

  return res
    .status(200)
    .set({
      "Content-Type": "application/json",
    })
    .send(JSON.stringify(todos));
}

export async function createTodoHandler(req: Request, res: Response) {
  try {
    const data = validateCreateTodoBody(req.body);

    await createTodoService(data);

    res
      .status(200)
      .set("Content-type", "application/json")
      .end(JSON.stringify(data));
  } catch (error: any) {
    res.status(400).end(error.message);
  }
}

export async function editTodoHandler(req: Request, res: Response) {
  try {
    const todoId = req.params.id;
    const data = validateCreateTodoBody(req.body);

    if (!todoId) {
      return res.status(403).end(JSON.stringify({ error: "Invalid todo id" }));
    }
    await editTodoService(todoId, data);

    res
      .status(200)
      .set("Content-type", "application/json")
      .end(JSON.stringify(data));
  } catch (error: any) {
    res.status(400).end(error.message);
  }
}

function validateCreateTodoBody(data: any) {
  if (data.title && data.description) {
    return {
      title: data.title.trim() as string,
      description: data.description.trim() as string,
    };
  }
  throw new Error("Invalid body. Missing fields!");
}

import { Request, Response } from "../types";
import { createTodoService, getTodosService } from "../services/todoService";

export async function getTodosHandler(req: Request, res: Response) {
  const todo = await getTodosService();

  return res
    .status(200)
    .set({ "Content-Type": "application/json" })
    .send(JSON.stringify(todo));
}

export async function createTodoHandler(req: Request, res: Response) {
  try {
    const data = validateCreateTodoBody(req.body);

    await createTodoService(data);
    res.status(204).set("Content-type", "text").end(JSON.stringify(data));
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

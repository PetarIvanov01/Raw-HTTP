import type { Router } from "../types.js";

import servePageHandler from "../handlers/static/servePageHandler.js";
import {
  createTodoHandler,
  editTodoHandler,
  getTodosHandler,
} from "../handlers/rest/todoHandler.js";

function initRoutes(router: Router) {
  router.get("/", servePageHandler);

  router.get("/todo", getTodosHandler);
  router.post("/todo", createTodoHandler);
  router.put("/todo/:id", editTodoHandler);

  console.log("[INFO] Routes initialized.");
}
export default initRoutes;

import type { Router } from "../types.js";

import servePageHandler from "../handlers/static/servePageHandler.js";
import {
  createTodoHandler,
  getTodosHandler,
} from "../handlers/rest/todoHandler.js";

function initRoutes(router: Router) {
  router.get("/", servePageHandler);

  router.get("/todo", getTodosHandler);
  router.post("/todo", createTodoHandler);

  console.log("[INFO] Routes initialized.");
}
export default initRoutes;

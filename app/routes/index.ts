import Router from "../router-engine/index.js";

import bodyParser from "../utils/bodyParser.js";

import indexHandler from "../handlers/indexHandler.js";
import { createTodoHandler, getTodosHandler } from "../handlers/todoHandler.js";

const router = Router.getInstance();

router.use(bodyParser.urlencoded());

router.get("/", indexHandler);

router.get("/todo", getTodosHandler);
router.post("/todo", createTodoHandler);

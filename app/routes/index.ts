import Router from "../router-engine/";

import indexHandler from "../handlers/indexHandler";
import { createTodoHandler, getTodosHandler } from "../handlers/todoHandler";
import bodyParser from "../utils/bodyParser";

const router = Router.getInstance();

router.use(bodyParser.urlencoded());

router.get("/", indexHandler);

router.get("/todo", getTodosHandler);
router.post("/todo", createTodoHandler);

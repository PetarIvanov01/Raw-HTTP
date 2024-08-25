import Router from "../router";

import indexHandler from "../handlers/indexHandler";
import echoHandler from "../handlers/echoHandler";

const router = Router.getInstance();

router.get("/", indexHandler);
router.get("/echo/:echo", echoHandler);

import Router from "../core/routing/index.js";
import bodyParser from "../core/lib/bodyParser.js";
import initRoutes from "../routes/initRoutes.js";

import cors from "./cors.js";

function initRouter() {
  const router = Router.getInstance();

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded());
  router.use(cors());

  initRoutes(router);

  console.log("[INFO] Router initialized with middlewares and routes.");
  return router;
}
export default initRouter;

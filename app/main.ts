import initDatabase from "./config/database.js";
import createServer from "./config/server.js";
import initRouter from "./config/router.js";

const PORT = Number(process.env.PORT || 4221);

main();
function main() {
  initDatabase();
  const router = initRouter();
  const server = createServer(router);

  server.listen(PORT, "localhost", () => {
    console.log(`[INFO] Server listening on http://localhost:${PORT}`);
  });
}

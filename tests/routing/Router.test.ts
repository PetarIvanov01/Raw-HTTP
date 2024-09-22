import { Router } from "../../app/core/routing/Router";
import { RouteHandler } from "../../app/core/routing/RouteHandler";
import { MiddlewareManager } from "../../app/core/routing/MiddlewareManager";
import { RequestProcessor } from "../../app/core/routing/RequestProcessor";
import { RequestParser } from "../../app/core/routing/RequestParser";
import type { Socket } from "../../app/types.js";

jest.mock("../../app/core/routing/RouteHandler");
jest.mock("../../app/core/routing/MiddlewareManager");
jest.mock("../../app/core/routing/RequestProcessor");
jest.mock("../../app/core/routing/RequestParser");

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    jest.clearAllMocks();

    router = Router.getInstance();
  });

  test("should create only one instance (singleton)", () => {
    const secondRouterInstance = Router.getInstance();
    expect(router).toBe(secondRouterInstance);
  });

  test("should add a GET route with handlers", () => {
    const path = "/test";
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    router.get(path, handler1, handler2);

    expect(RouteHandler.prototype.addRoute).toHaveBeenCalledWith("GET", path, [
      handler1,
      handler2,
    ]);
  });

  test("should add a POST route with handlers", () => {
    const path = "/test";
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    router.post(path, handler1, handler2);

    expect(RouteHandler.prototype.addRoute).toHaveBeenCalledWith("POST", path, [
      handler1,
      handler2,
    ]);
  });

  test("should use middleware handler", () => {
    const middlewareHandler = jest.fn();

    router.use(middlewareHandler);

    expect(MiddlewareManager.prototype.use).toHaveBeenCalledWith(
      middlewareHandler
    );
  });

  test("should dispatch an incoming request", () => {
    const mockRequestParser = new RequestParser(
      Buffer.from("GET /test HTTP/1.1")
    );
    const mockSocket = {} as Socket;

    router.dispatchIncomingRequest(mockRequestParser, mockSocket);

    expect(RequestProcessor.prototype.processRequest).toHaveBeenCalledWith(
      mockRequestParser,
      mockSocket
    );
  });
});

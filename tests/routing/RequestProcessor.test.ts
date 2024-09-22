import { RequestProcessor } from "../../app/core/routing/RequestProcessor.js";
import { RouteHandler } from "../../app/core/routing/RouteHandler.js";
import { MiddlewareManager } from "../../app/core/routing/MiddlewareManager.js";
import { HTTPResponse } from "../../app/core/routing/HTTPResponse.js";
import { RequestParser } from "../../app/core/routing/RequestParser.js";

import serveStaticFilesHandler from "../../app/handlers/static/serveStaticFilesHandler.js";
import handleNotFound from "../../app/handlers/static/notFoundHandler.js";

import {
  RequestLineError,
  RequestHeadersError,
} from "../../app/core/routing/Errors.js";

jest.mock("../../app/core/routing/RouteHandler.js");
jest.mock("../../app/core/routing/MiddlewareManager.js");
jest.mock("../../app/core/routing/HTTPResponse.js");
jest.mock("../../app/core/routing/RequestParser.js");
jest.mock("../../app/handlers/static/notFoundHandler.js");
jest.mock("../../app/handlers/static/serveStaticFilesHandler.js");

describe("RequestProcessor", () => {
  let requestProcessor: RequestProcessor;
  let mockRouteHandler: jest.Mocked<RouteHandler>;
  let mockMiddlewareManager: jest.Mocked<MiddlewareManager>;
  let mockRequestParser: jest.Mocked<RequestParser>;

  let mockResponse: jest.Mocked<HTTPResponse>;
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouteHandler = new RouteHandler() as jest.Mocked<RouteHandler>;
    mockMiddlewareManager =
      new MiddlewareManager() as jest.Mocked<MiddlewareManager>;
    mockRequestParser = new RequestParser(
      Buffer.from("GET / HTTP/1.1")
    ) as jest.Mocked<RequestParser>;

    mockSocket = {}; // Mock socket object

    mockResponse = new HTTPResponse(mockSocket) as jest.Mocked<HTTPResponse>;
    const end = jest.fn();
    HTTPResponse.prototype.status = jest.fn((code) => {
      return { end };
    }) as any;
    mockResponse.status = HTTPResponse.prototype.status as any;
    mockResponse.end = end;

    requestProcessor = new RequestProcessor(
      mockRouteHandler,
      mockMiddlewareManager
    );
  });

  test("should call route handlers when a route is found", () => {
    const route = { params: { id: "123" }, handlers: [jest.fn()] };

    mockRouteHandler.findRoute.mockReturnValue(route);
    mockMiddlewareManager.getMiddlewares.mockReturnValue([]);
    mockRequestParser.getRequestLine.mockReturnValue({
      method: "GET",
      pathname: "/test",
    });

    requestProcessor.processRequest(mockRequestParser, mockSocket);

    expect(route.handlers[0]).toHaveBeenCalled();
  });

  test("should handle static file requests", () => {
    const mockHeaders = {
      host: "localhost",
      accept: "*",
      "user-agent": "test",
    };
    mockRequestParser.getRequestLine.mockReturnValue({
      pathname: "/file.js",
      method: "GET",
      extension: ".js",
    });

    mockRequestParser.getRequestHeaders.mockReturnValue(mockHeaders);
    requestProcessor.processRequest(mockRequestParser, mockSocket);

    // Verify that serveStaticFilesHandler is called for static file requests
    expect(serveStaticFilesHandler).toHaveBeenCalled();
  });

  test("should call handleNotFound when route and static file are not found", () => {
    mockRouteHandler.findRoute.mockReturnValue(null);
    mockRequestParser.getRequestLine.mockReturnValue({
      pathname: "/nonexistent",
      method: "GET",
      extension: undefined,
    });

    requestProcessor.processRequest(mockRequestParser, mockSocket);

    expect(handleNotFound).toHaveBeenCalled();
  });

  test("should handle RequestLineError by responding with correct status code", () => {
    const error = new RequestLineError(400);

    mockRequestParser.getRequestLine.mockImplementation(() => {
      throw error;
    });

    requestProcessor.processRequest(mockRequestParser, mockSocket);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.end).toHaveBeenCalled();
  });

  test("should handle RequestHeadersError by responding with correct status code", () => {
    mockRequestParser.getRequestLine.mockReturnValue({
      method: "GET",
      pathname: "/test",
    });

    const error = new RequestHeadersError(400);

    mockRequestParser.getRequestHeaders.mockImplementation(() => {
      throw error;
    });

    requestProcessor.processRequest(mockRequestParser, mockSocket);

    // Verify that the correct status code is sent
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.end).toHaveBeenCalled();
  });

  test("should respond with 500 when an unknown error occurs", () => {
    mockRequestParser.getRequestLine.mockImplementation(() => {
      throw new Error("Unknown error");
    });

    requestProcessor.processRequest(mockRequestParser, mockSocket);

    // Verify that a 500 Internal Server Error is sent
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.end).toHaveBeenCalled();
  });

  test("should execute middlewares and handlers in order", async () => {
    const route = {
      params: {},
      handlers: [jest.fn((req, res, next) => next())],
    };
    const middleware1 = jest.fn((req, res, next) => next());
    const middleware2 = jest.fn((req, res, next) => next());

    mockRouteHandler.findRoute.mockReturnValue(route);

    mockMiddlewareManager.getMiddlewares.mockReturnValue([
      middleware1,
      middleware2,
    ]);
    mockRequestParser.getRequestLine.mockReturnValue({
      pathname: "/test",
      method: "GET",
      extension: undefined,
    });

    await requestProcessor.processRequest(mockRequestParser, mockSocket);

    // Ensure middlewares and route handlers are called in order
    expect(middleware1).toHaveBeenCalled();
    expect(middleware2).toHaveBeenCalled();
    expect(route.handlers[0]).toHaveBeenCalled();
  });
});

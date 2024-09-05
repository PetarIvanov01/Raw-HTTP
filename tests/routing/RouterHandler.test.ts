import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from "@jest/globals";

import { RouteHandler } from "../../app/core/routing/RouteHandler.js";
import type { HttpHandler } from "../../app/types.js";

describe("RouteHandler", () => {
  let routeHandler: RouteHandler;
  let mockHandler: HttpHandler = jest.fn();

  beforeEach(() => {
    routeHandler = new RouteHandler();
    mockHandler = jest.fn();
  });

  test("should add and find a GET route without parameters", () => {
    const method = "GET";
    const path = "/home";

    routeHandler.addRoute(method, path, mockHandler);

    const foundRoute = routeHandler.findRoute(method, "/home");

    expect(foundRoute).toBeTruthy();
    expect(foundRoute?.handler).toBe(mockHandler);
    expect(foundRoute?.params).toEqual({});
  });

  test("should return null for non-existing route", () => {
    const foundRoute = routeHandler.findRoute("GET", "/non-existent");

    expect(foundRoute).toBeNull();
  });

  test("should correctly handle routes with parameters", () => {
    const method = "GET";
    const path = "/users/:id";

    routeHandler.addRoute(method, path, mockHandler);

    const foundRoute = routeHandler.findRoute(method, "/users/123");

    expect(foundRoute).toBeTruthy();
    expect(foundRoute?.handler).toBe(mockHandler);
    expect(foundRoute?.params).toEqual({ id: "123" });
  });

  test("should handle multiple route parameters", () => {
    const method = "GET";
    const path = "/posts/:postId/comments/:commentId";

    routeHandler.addRoute(method, path, mockHandler);

    const foundRoute = routeHandler.findRoute(method, "/posts/10/comments/5");

    expect(foundRoute).toBeTruthy();
    expect(foundRoute?.handler).toBe(mockHandler);
    expect(foundRoute?.params).toEqual({ postId: "10", commentId: "5" });
  });

  test("should differentiate between HTTP methods", () => {
    const getHandler: HttpHandler = jest.fn();
    const postHandler: HttpHandler = jest.fn();
    const path = "/posts";

    routeHandler.addRoute("GET", path, getHandler);
    routeHandler.addRoute("POST", path, postHandler);

    const foundGetRoute = routeHandler.findRoute("GET", "/posts");
    expect(foundGetRoute).toBeTruthy();
    expect(foundGetRoute?.handler).toBe(getHandler);

    const foundPostRoute = routeHandler.findRoute("POST", "/posts");
    expect(foundPostRoute).toBeTruthy();
    expect(foundPostRoute?.handler).toBe(postHandler);
  });

  test("should differentiate between HTTP methods v2", () => {
    const getHandler: HttpHandler = jest.fn();
    const postHandler: HttpHandler = jest.fn();
    const path = "/posts";

    routeHandler.addRoute("PUT", path, getHandler);
    routeHandler.addRoute("DELETE", path, postHandler);

    const foundGetRoute = routeHandler.findRoute("PUT", "/posts");
    expect(foundGetRoute).toBeTruthy();
    expect(foundGetRoute?.handler).toBe(getHandler);

    const foundPostRoute = routeHandler.findRoute("DELETE", "/posts");
    expect(foundPostRoute).toBeTruthy();
    expect(foundPostRoute?.handler).toBe(postHandler);
  });

  test("should return null if method doesn't match", () => {
    const path = "/tasks";

    routeHandler.addRoute("GET", path, mockHandler);

    const foundRoute = routeHandler.findRoute("POST", "/tasks");

    expect(foundRoute).toBeNull();
  });
});

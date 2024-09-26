import type { Request, Response, NextFunction } from "../../types.js";
export default function defaultErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = JSON.stringify({
    message: "Internal server error",
    stack: err instanceof Error ? err.stack : "No stack trace",
  });

  res
    .status(500)
    .set({
      "Content-Type": "Application/json",
      "Content-Length": body.length,
    })
    .send(body);
}

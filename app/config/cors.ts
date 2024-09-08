import type { Request, Response } from "../types.js";
export default function cors() {
  return (req: Request, res: Response) => {
    res.set({
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
  };
}

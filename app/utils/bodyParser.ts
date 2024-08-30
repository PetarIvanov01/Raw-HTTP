import { Request, Response } from "../types";
function parser() {
  return {
    json: () => (req: Request, res: Response) => {
      if (req.headers["content-type"] === "application/json") {
      }
    },
    urlencoded: () => (req: Request, res: Response) => {
      if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
        const body = (req.body as string)
          .split("&")
          .map((e) => e.split("="))
          .reduce((prev, [key, value]) => {
            const decodedKey = decodeURIComponent(
              key
                .replace(/\+/g, " ")
                .replace(/(%0A|%0D|\r\n|\n|\r)/g, " ")
                .trim()
            );
            const decodedValue = (
              value
                ? decodeURIComponent(
                    value
                      .replace(/\+/g, " ")
                      .replace(/(%0A|%0D|\r\n|\n|\r)/g, " ")
                  )
                : ""
            ).trim();
            if (prev[decodedKey]) {
              if (Array.isArray(prev[decodedKey])) {
                prev[decodedKey].push(decodedValue);
              } else {
                prev[decodedKey] = [prev[decodedKey], decodedValue];
              }
            } else {
              prev[decodedKey] = decodedValue;
            }

            return prev;
          }, {} as Record<string, any>);

        req.body = body;
      }
    },
  };
}

const bodyParser = parser();

export default bodyParser;

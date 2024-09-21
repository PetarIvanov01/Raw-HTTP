export const mimeType = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/x-font-ttf",
  ".map": "application/json",
};
export const statusMessages: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  414: "URI Too Long",
  500: "Internal Error",
  501: "Not Implemented",
  505: "HTTP Version Not Supported",
};

export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "PATCH",
];

export const MAX_REQUEST_TARGET_LENGTH = 2000;
export const HOST_PATTERN = /^[a-zA-Z0-9.-]+(:[0-9]{1,5})?$/;

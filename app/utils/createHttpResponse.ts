const statusMessages: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Error",
};

export default function createResponse(
  statusNumber: number,
  options?: {
    contentType?: string;
    contentLength?: number;
    responseData?: string;
    contentEncoding?: string;
    connection?: string;
  }
) {
  let response = `HTTP/1.1 ${statusNumber} ${statusMessages[statusNumber]}\r\n`;

  if (options) {
    const {
      contentType,
      contentLength,
      responseData,
      contentEncoding,
      connection,
    } = options;

    if (contentLength !== undefined) {
      response += `Content-Length: ${contentLength}\r\n`;
    } else if (responseData) {
      response += `Content-Length: ${Buffer.byteLength(responseData)}\r\n`;
    }

    if (contentEncoding) {
      response += `Content-Encoding: ${contentEncoding}\r\n`;
    }

    if (contentType) {
      response += `Content-Type: ${contentType}\r\n`;
    }

    if (connection) {
      response += `Connection: ${connection}\r\n`;
    }

    response += "\r\n";

    if (responseData) {
      response += responseData;
    }
  } else {
    response += "\r\n";
  }

  return response;
}

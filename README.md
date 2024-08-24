# Raw-HTTP - HTTP Server Node.js using `net` Library

This project is an implementation of a basic HTTP server built using the `net` library in Node.js. The purpose of this project is to improve my understandings of how the HTTP protocol works at a lower level by directly handling TCP connections, parsing HTTP requests, and constructing HTTP responses without relying on high-level abstractions like `http` or `express`.

## Features

### Core HTTP Functionality

- **TCP Server:** The server is built using the `net.createServer()` method, allowing direct handling of TCP connections. This simulates the behavior of an HTTP server by listening on a specific port for incoming client connections.
- **Request Parsing:** The server can parse the request line, headers, and body of an incoming HTTP request. This includes:
  - **Method Parsing:** Identifies the HTTP method (e.g., GET, POST).
  - **Pathname Extraction:** Extracts the requested resource path from the URL.
  - **Header Parsing:** Handles common HTTP headers, including `Host`, `User-Agent`, `Accept`, `Content-Type`, and `Content-Length`.
  - **Body Handling:** Supports request bodies, including handling of `gzip` encoded data.

### Response Handling

- **Static File Serving:** The server can serve static files from a specified directory, mimicking basic file handling.
- **Dynamic Content:** The server can respond with dynamically generated content, such as reflecting back the User-Agent or compressing parts of the response using gzip(Not Working).
- **Custom Response Construction:** Responses are manually constructed, allowing complete control over the status line, headers, and body.

### Compression Support - Not Working for now!

- **Gzip Compression:** The server can compress response data using gzip, based on client requests that include the `Accept-Encoding: gzip` header.

### Error Handling

- **404 Not Found:** The server includes basic error handling, responding with a `404 Not Found` status when a requested resource is not available.
- **Method Handling:** The server primarily supports GET requests, with limited POST handling.

## How It Works

1. **TCP Connection:**

   - The server listens on port `4221` for incoming connections. When a client connects, the server handles the raw TCP data.

2. **Request Processing:**

   - The incoming data is parsed to extract the HTTP method, pathname, headers, and body.
   - Based on the method and pathname, the server determines how to respond.

3. **Response Generation:**

   - The response is manually constructed to include the correct status line, headers (such as `Content-Type` and `Content-Length`), and the body.

4. **Gzip Compression: - SOON!**

   - If the client supports gzip compression, the server can compress the response body before sending it back.

5. **Connection Management:**
   - After sending the response, the server closes the connection, logging relevant details to the console.

## Example Use Cases

### Serving Static Files

- Requests to paths like `/files/filename.txt` serve the corresponding file from the `/public` directory.

### Echoing Data

- Requests to `/echo/some-text` respond with the `some-text` portion of the URL, compressed using gzip if the client supports it.

### User-Agent Reflection

- Requests to `/user-agent` respond with the client's `User-Agent` string.

## Future Plans

I’m planning to add some more basic HTTP features and build a small web app using this server. Here’s what I’m going to add:

- Serving static files like HTML, CSS, and JavaScript
- Parsing query parameters in URLs
- Finishing gzip compression for responses
- Improving error handling
- Possibly adding support for middleware

## Try It

To run this server, clone the repository and install the necessary Node.js dependencies:

> [!NOTE]
> Currently, this project requires Bun to run. However, I am planning to transition to Node.js soon.

```bash
git clone https://github.com/PetarIvanov01/Raw-HTTP.git
cd ./Raw-HTTP
npm install
npm run dev
```

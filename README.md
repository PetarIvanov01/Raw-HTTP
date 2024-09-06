# Raw-HTTP - HTTP Server Node.js using `net` Library

This project is an implementation of a basic HTTP server built using the `net` library in Node.js. The purpose of this project is to improve my understanding of how the HTTP protocol works at a lower level by directly handling TCP connections, parsing HTTP requests, and constructing HTTP responses without relying on high-level abstractions like `http` or `express`.

## Features

### Core HTTP Functionality

- **TCP Server:** The server is built using the `net.createServer()` method, allowing direct handling of TCP connections. It acts as an HTTP server by listening on a specified port for incoming client connections and managing the raw TCP communication.

### Request Parsing

- **Method Parsing:** Identifies the HTTP method (e.g., GET, POST, PUT, DELETE).
- **Pathname Extraction:** Extracts the requested resource path from the URL.
- **Header Parsing:** Fully parses all HTTP headers sent by the client.
- **Body Handling:** Supports request bodies, including handling of `gzip` encoded data.

### Response Handling

- **Static File Serving:** The server can efficiently serve static files from the `/public` directory, including HTML, CSS, JavaScript, images, and other resources. This allows the server to function as a basic web server, delivering front-end assets to clients.
- **Dynamic Content:** The server can generate and serve dynamic content in JSON format, allowing for flexible API-like responses.
- **Custom Response Construction:** All responses are manually constructed, giving complete control over the status line, headers, and body.

### Compression Support

- **Gzip Compression:** The server can compress response data using gzip, based on client requests that include the `Accept-Encoding: gzip` header.

### Error Handling

- **404 Not Found:** The server includes basic error handling, responding with a `404 Not Found` status when a requested resource is not available.

## Core Libraries

In addition to the core HTTP functionality, the server includes custom-built libraries located in the `/core` directory, which handle various essential tasks such as routing and database management. These libraries were designed to meet the specific needs of the application and enhance its functionality.

### Routing

Custom routing library that enables dynamic and flexible routing of HTTP requests. This routing system provides the following capabilities:

- **Route Matching:** The router matches incoming requests to predefined routes based on the HTTP method (e.g., `GET`, `POST`, `PUT`, `DELETE`) and the requested URL path.
- **Dynamic Parameters:** Supports dynamic route parameters, allowing requests like `/user/:id` to be handled, where `:id` is a variable part of the route that can be captured and used in the handler function.
- **Flexible Route Handlers:** Each route can have custom handler functions that execute specific logic, such as retrieving data, generating dynamic content, or interacting with the database.
- **Middleware Support:** The routing system is designed to be extendable with middleware, enabling features like authentication, logging, and request validation to be applied either globally or to specific routes.

By leveraging this custom routing, the server is capable of efficiently managing complex request handling and providing dynamic responses.

### Custom Database

To explore alternative methods of data storage, I implemented a custom database using CSV files. The database interacts with the filesystem directly through Node.js's built-in fs module.

- **CSV-Based Tables:** Each table is represented by a CSV file in the `/database` directory. The database allows for the creation and deletion of these tables, while each table supports full CRUD operations (Create, Read, Update, Delete) on its rows.

- **CRUD Operations on Tables:**

  - **Create & Delete Tables:** The Database class provides methods to create new tables (CSV files) and delete existing ones.
  - **Row Operations:** Each table supports row-based operations, including adding new rows, fetching existing rows, updating specific rows based on conditions, and deleting rows. All of these operations modify the underlying CSV file directly.

- **Dependency Injection for FileSystem API:** By injecting the filesystem interface (FileSystemI), the Database class supports different filesystem APIs, making it easier to write tests and swap out file-handling strategies without changing the core logic.

- **Dynamic and Flexible Structure:** Tables are created dynamically with specified columns, and each row has an automatically generated id field for easy identification and management. You can query and modify rows based on any column values.

- **Data Persistence:** Since all data is stored in CSV files, the system ensures data persistence across server restarts.

This custom database may not be the most optimized way to store and manage data. Handling CSV files can be slower for large datasets or more complex queries, but the goal of this project was to explore how data can be stored and manipulated in different ways.

## How It Works

1. **Handling TCP Connections:**

   - The server listens on port `4221` for incoming connections. When a client connects, the server receives the raw TCP data and begins processing thre request.

2. **Parsing HTTP Requests:**

   - Once the server receives data, it parses the HTTP request to extract key information such as the method (e.g., GET, POST), the requested URL (pathname), headers, and any body content.

3. **Generating Responses:**

   - Based on the request method and URL, the server determines how to respond. It manually constructs the HTTP response, including the status line, headers like `Content-Type and Content-Length`, and the response body. Static files or dynamically generated content can be served depending on the request.

4. **Gzip Compression:**

   - If the client supports gzip compression, the server can compress the response body before sending it back.

5. **Connection Management:**
   - After sending the response, the server closes the connection, logging relevant details to the console.

## Current Plans

I’m working on a client-side application that interacts with the server. It's a simple Todo application with full CRUD (Create, Read, Update, Delete) functionality. The server will play a central role in both serving the initial HTML page and handling all subsequent interactions via AJAX requests.

**Key aspects of the current plans include:**

**Serving the HTML Page:**

- The initial HTML page for the Todo application will be served directly by the server, allowing users to interact with the app through their browsers.

**AJAX Requests:**

- Once the HTML page is loaded, all CRUD operations will be handled through asynchronous AJAX requests sent to the server. This allows for dynamic updates to the Todo list without needing to reload the page.

**CRUD Operations:**

- Users will be able to add, view, update, and delete Todo items, with each operation being processed by the server and persisted using the custom CSV-based database system.

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

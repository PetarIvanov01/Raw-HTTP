const BASE_URL = "http://localhost:4221";

const endpoints = {
  getAll: "/todo",
  create: "/todo",
  edit: (id) => `/todo/${id}`,
};

async function request(url, method = "GET", data = null, headers = {}) {
  const request = await fetch(url, {
    method,
    headers,
    body: data,
  });

  if (!request.ok) {
    throw new Error("Failed request.");
  }

  if (request.status === 204) {
    return;
  }
  return request.json();
}

export async function getTodos() {
  const url = BASE_URL + endpoints.getAll;
  return await request(url);
}

export async function createTodo(todo) {
  const url = BASE_URL + endpoints.create;

  return await request(url, "POST", JSON.stringify(todo), {
    "Content-Type": "application/json",
  });
}

export async function editTodo(id, todo) {
  const url = BASE_URL + endpoints.edit(id);

  return await request(url, "PUT", JSON.stringify(todo), {
    "Content-Type": "application/json",
  });
}

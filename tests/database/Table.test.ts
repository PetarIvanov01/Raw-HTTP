import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from "@jest/globals";
import * as path from "path";
import { customFileSystem as fs } from "../../app/lib/fileSystem.js";

import { Database } from "../../app/database/Database.js";
import Table from "../../app/database/_Table.js";

const DB_NAME = "TEST";
const dbPath = path.join(process.cwd(), DB_NAME);
const mockTodos = [
  { description: "todo description - 1", id: "1", title: "Todo 1" },
  { description: "todo description - 2", id: "2", title: "Todo 2" },
  { description: "todo description - 3", id: "3", title: "Todo 3" },
  { description: "todo description - 4", id: "4", title: "Todo 4" },
];

function clean() {
  try {
    fs.rmSync(dbPath);
  } catch (error) {
    return;
  }
}

function setupDb() {
  const db = new Database(DB_NAME, dbPath, fs);
  const tableTodo = db.createOrGetTable("todo", ["id", "title", "description"]);
  const tableUsers = db.createOrGetTable("users", [
    "id",
    "firstName",
    "lastName",
  ]);
  return { tableTodo, tableUsers };
}

async function loadTableWithTodos(
  table: Table<["id", "title", "description"]>,
  rows = 50
) {
  for (let i = 10; i < rows + 10; i++) {
    await table.createRow({
      id: i.toString(),
      description: `Description - ${i}`,
      title: `Title - ${i}`,
    });
  }
}

describe("Table class tests", () => {
  beforeAll(() => {
    return clean();
  });

  afterAll(() => {
    return clean();
  });

  beforeEach(() => {
    return clean();
  });

  afterEach(() => {
    return clean();
  });

  // Unit
  test("should create a new table if it does not exist", () => {
    setupDb();

    const tableName = "not-exists.csv";
    const tablePath = path.join(dbPath, tableName);
    const table = new Table("not-exists", tablePath, ["test"], fs);

    expect(() => fs.accessSync(table.tablePath)).not.toThrow();
  });
  // Unit
  test("should create a new row and verify it exists in the table", async () => {
    const { tableTodo } = setupDb();
    const todo = mockTodos[0];

    await tableTodo.createRow(todo);

    const exist = await tableTodo.fetchOneRow({
      where: { id: todo.id },
    });

    expect(exist).toEqual(todo);
  });
  // Unit
  test("should increase table size after inserting a new row", async () => {
    const { tableTodo } = setupDb();
    const todo = mockTodos[0];

    const oldSize = tableTodo.tableSize;

    await tableTodo.createRow(todo);

    const newSize = tableTodo.tableSize;
    expect(newSize).toBeGreaterThan(oldSize);
  });

  test("should fetch the correct number of rows", async () => {
    const { tableTodo } = setupDb();
    const rowCount = 10;

    await loadTableWithTodos(tableTodo, 30);

    const rows = await tableTodo.fetchRows(rowCount);
    expect(rows.length).toStrictEqual(rowCount);
  });

  test("should return undefined if the row does not exist in the table", async () => {
    const { tableTodo } = setupDb();

    await loadTableWithTodos(tableTodo, 10);
    const exist = await tableTodo.fetchOneRow({ where: { id: "undefined" } });

    expect(exist).toBe(undefined);
  });

  test("should return undefined if the query for searching is empty", async () => {
    const { tableTodo } = setupDb();

    await loadTableWithTodos(tableTodo, 10);
    const exist = await tableTodo.fetchOneRow({ where: {} });

    expect(exist).toBe(undefined);
  });

  test("should throw error if trying to delete not existing row", async () => {
    const { tableTodo } = setupDb();

    await loadTableWithTodos(tableTodo);
    const rowToFind = { id: "undefiend" };
    try {
      await tableTodo.deleteRow({ where: rowToFind });
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test("should not throw if trying to delete existing row", async () => {
    const { tableTodo } = setupDb();
    const mockTodo = mockTodos[0];

    await loadTableWithTodos(tableTodo);
    await tableTodo.createRow(mockTodo);
    const byteRange = await tableTodo.deleteRow({ where: mockTodo });

    expect(byteRange).toBe(undefined);
  });
});

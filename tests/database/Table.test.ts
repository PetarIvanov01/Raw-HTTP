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
import { customFileSystem as fs } from "../../app/core/lib/fileSystem.js";

import { Database } from "../../app/core/database/Database.js";
import Table from "../../app/core/database/Table.js";

const DB_NAME = "TEST";
const dbPath = path.join(process.cwd(), DB_NAME);
const mockTodos = [
  { description: "todo description - 1", title: "Todo 1" },
  { description: "todo description - 2", title: "Todo 2" },
  { description: "todo description - 3", title: "Todo 3" },
  { description: "todo description - 4", title: "Todo 4" },
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
  const tableTodo = db.createOrGetTable("todo", ["title", "description"]);
  const tableUsers = db.createOrGetTable("users", ["firstName", "lastName"]);
  return { tableTodo, tableUsers };
}

async function loadTableWithTodos(
  table: Table<["title", "description"]>,
  rows = 50
) {
  for (let i = 10; i < rows + 10; i++) {
    await table.createRow({
      title: `Title - ${i}`,
      description: `Description - ${i}`,
    });
  }
}

function preloadTable() {
  let result = "id,title,description\n";
  for (let i = 1; i <= 10; i++) {
    result += `${i},Title - ${i},Description - ${i}\n`;
  }
  const db = new Database(DB_NAME, dbPath, fs);
  fs.writeFileSync(path.join(dbPath, "todo.csv"), result);

  const tableTodo = db.createOrGetTable("todo", ["title", "description"]);

  return { tableTodo, size: result.length };
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
      where: { id: "1" },
    });

    expect(exist?.title).toEqual(todo.title);
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

  // Integration?
  test("should correctly initialize table size after preloading data", () => {
    const { tableTodo, size } = preloadTable();
    expect(tableTodo.tableSize).toBe(size);
  });

  test("should increase table internal id after inserting a new row", async () => {
    const { tableTodo } = setupDb();

    await loadTableWithTodos(tableTodo, 20);

    const internalIdCount = (tableTodo as any)._idCounter;
    expect(internalIdCount).toEqual(20);
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

  test("should update the table size after updating the row with larger field length", async () => {
    const { tableTodo } = setupDb();
    await loadTableWithTodos(tableTodo);

    const description =
      "This is a much longer description that exceeds the previous description length.";
    const rowToFind = { id: "3" };
    const data = { description };

    const tableSizeBeforeUpdate = tableTodo.tableSize;
    const rowBeforeUpdate = await tableTodo.fetchOneRow({ where: rowToFind });

    await tableTodo.updateRow({ where: rowToFind }, data);

    const tableSizeAfterUpdate = tableTodo.tableSize;
    const rowAfterUpdate = await tableTodo.fetchOneRow({ where: rowToFind });

    if (!rowBeforeUpdate || !rowAfterUpdate) {
      throw new Error("Row does not exist");
    }

    expect(tableSizeAfterUpdate - tableSizeBeforeUpdate).toBe(
      rowAfterUpdate.description.length - rowBeforeUpdate.description.length
    );
  });

  test("should not change the table size when updating a row with the same data", async () => {
    const { tableTodo } = setupDb();
    await loadTableWithTodos(tableTodo);

    const rowToFind = { id: "2" };
    const rowBeforeUpdate = await tableTodo.fetchOneRow({ where: rowToFind });

    if (!rowBeforeUpdate) {
      throw new Error("Row does not exist");
    }

    const data = { description: rowBeforeUpdate.description };
    const tableSizeBeforeUpdate = tableTodo.tableSize;

    await tableTodo.updateRow({ where: rowToFind }, data);

    const tableSizeAfterUpdate = tableTodo.tableSize;

    expect(tableSizeBeforeUpdate).toBe(tableSizeAfterUpdate);
  });

  test("should throw error when trying to update a non-existent row", async () => {
    const { tableTodo } = setupDb();
    await loadTableWithTodos(tableTodo);

    const rowToFind = { id: "9999" }; // Non-existent row ID
    const data = { description: "Updated description" };

    try {
      await tableTodo.updateRow({ where: rowToFind }, data);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test("should correctly handle multiple updates to the same row", async () => {
    const { tableTodo } = setupDb();
    await loadTableWithTodos(tableTodo);

    const rowToFind = { id: "4" };
    const initialDescription = "First update";
    const secondDescription = "Second update with even longer content";

    const tableSizeBeforeUpdate = tableTodo.tableSize;

    await tableTodo.updateRow(
      { where: rowToFind },
      { description: initialDescription }
    );
    const tableSizeAfterFirstUpdate = tableTodo.tableSize;

    await tableTodo.updateRow(
      { where: rowToFind },
      { description: secondDescription }
    );
    const tableSizeAfterSecondUpdate = tableTodo.tableSize;

    expect(tableSizeAfterFirstUpdate).toBeLessThan(tableSizeBeforeUpdate);
    expect(tableSizeAfterSecondUpdate).toBeGreaterThan(
      tableSizeAfterFirstUpdate
    );
  });

  test("should throw error if trying to delete not existing row", async () => {
    const { tableTodo } = setupDb();

    await loadTableWithTodos(tableTodo);
    const rowToFind = { title: "undefiend" };

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

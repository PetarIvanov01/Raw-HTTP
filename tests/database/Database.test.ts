import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from "@jest/globals";
import { Database } from "../../app/core/database/Database.js";

import * as path from "node:path";
import { customFileSystem as fs } from "../../app/core/lib/fileSystem.js";

const DB_NAME = "TEST";
const dbPath = path.join(process.cwd(), DB_NAME);

function clean() {
  try {
    fs.rmSync(dbPath);
  } catch (error) {
    return;
  }
}

function setupTable() {
  const tableName = "_todo";
  const fileName = `${tableName}.csv`;
  const head = ["id", "user"];
  const filePath = path.join(dbPath, fileName);

  fs.mkdirSync(dbPath, { recursive: true });
  fs.writeFileSync(filePath, head.join(",") + "\n");

  expect(() => fs.accessSync(dbPath)).not.toThrow();
  expect(() => fs.accessSync(filePath)).not.toThrow();

  return {
    tableName,
    fileName,
    filePath,
    head,
  };
}

function setupDb() {
  const db = new Database(DB_NAME, dbPath, fs as any);
  return { db };
}

describe("Database class tests", () => {
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
  test("should initialize the database with 0 tables", () => {
    const { db } = setupDb();
    expect(db).toBeInstanceOf(Database);
    expect(db.listTables().length).toBe(0);
  });

  // Unit
  test("should throw if trying to delete a table that does not exist", () => {
    const { tableName } = setupTable();
    const { db } = setupDb();

    expect(() => db.deleteTable("not-exist")).toThrow("Table does'not exist.");
  });

  // Unit
  test("should create a todo table file in the directory", () => {
    const { db } = setupDb();
    const todoTable = db.createOrGetTable("_todo", ["id", "name"]);

    expect(() => fs.statSync(todoTable.tablePath)).not.toThrow();
  });

  // Unit
  test("should delete a table from the database", () => {
    const { db } = setupDb();
    const todoTable = db.createOrGetTable("_todo", ["id", "user"]);

    expect(db.listTables()).toContain(todoTable.tableName);

    db.deleteTable("_todo");

    expect(db.listTables()).not.toContain(todoTable.tableName);
  });

  // Unit
  test("should initialize a todo table", () => {
    const { db } = setupDb();
    const todoTable = db.createOrGetTable("_todo", ["id", "name"]);

    const tables = db.listTables();
    expect(tables).toContain(todoTable.tableName);
  });

  // Integration
  test("should create the database directory in the file system", () => {
    setupDb();
    expect(() => fs.statSync(dbPath)).not.toThrow();
  });

  // Integration
  test("should delete the table file from the directory", () => {
    const { db } = setupDb();
    const todoTable = db.createOrGetTable("_todo", ["id", "user"]);

    expect(() => fs.statSync(todoTable.tablePath)).not.toThrow();

    db.deleteTable("_todo");

    expect(() => fs.statSync(todoTable.tablePath)).toThrow();
  });

  // Integration
  test("should load tables from existing database file directory", () => {
    const { tableName } = setupTable();

    const { db } = setupDb();
    const tables = db.listTables();

    expect(tables.length).toBeGreaterThanOrEqual(1);
    expect(tables).toContain(tableName);
  });

  // Integration
  test("should have the same table head after reloading the database", () => {
    const { tableName, head } = setupTable();

    const { db } = setupDb();
    const table = db.createOrGetTable(tableName, head);

    expect(table.columns).toEqual(expect.arrayContaining(head));
  });
});

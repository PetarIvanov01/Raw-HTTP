import { describe, test, expect } from "@jest/globals";
import { Database } from "../../../app/database/Database.js";
import * as path from "node:path";
import * as fs from "node:fs";

const DB_NAME = "TEST";
const dbPath = path.join(process.cwd(), DB_NAME);

function clean() {
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true, recursive: true });
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

describe("Database class tests", () => {
  beforeAll(() => {
    clean();
  });

  afterAll(() => {
    clean();
  });

  beforeEach(() => {
    clean();
  });

  afterEach(() => {
    clean();
  });

  test("should initialize the database with 0 tables", () => {
    const db = new Database(DB_NAME, dbPath);
    expect(db).toBeInstanceOf(Database);
    expect(db.listTables().length).toBe(0);
  });

  test("should create the database directory in the file system", () => {
    new Database(DB_NAME, dbPath);
    expect(() => fs.statSync(dbPath)).not.toThrow();
  });

  test("should initialize a todo table", () => {
    const db = new Database(DB_NAME, dbPath);
    const todoTable = db.createOrGetTable("_todo", ["id", "name"]);

    const tables = db.listTables();
    expect(tables).toContain(todoTable.tableName);
  });

  test("should create a todo table file in the directory", () => {
    const db = new Database(DB_NAME, dbPath);
    const todoTable = db.createOrGetTable("_todo", ["id", "name"]);

    expect(() => fs.statSync(todoTable.tablePath)).not.toThrow();
  });

  test("should delete a table from the database", () => {
    const db = new Database(DB_NAME, dbPath);
    const todoTable = db.createOrGetTable("_todo", ["id", "user"]);

    expect(db.listTables()).toContain(todoTable.tableName);

    db.deleteTable("_todo");

    expect(db.listTables()).not.toContain(todoTable.tableName);
  });

  test("should delete the table file from the directory", () => {
    const db = new Database(DB_NAME, dbPath);
    const todoTable = db.createOrGetTable("_todo", ["id", "user"]);

    expect(() => fs.statSync(todoTable.tablePath)).not.toThrow();

    db.deleteTable("_todo");

    expect(() => fs.statSync(todoTable.tablePath)).toThrow();
  });

  test("should load tables from existing database file directory", () => {
    const { tableName } = setupTable();

    const db = new Database(tableName, dbPath);
    const tables = db.listTables();

    expect(tables.length).toBeGreaterThanOrEqual(1);
    expect(tables).toContain(tableName);
  });

  test("should have the same table head after reloading the database", () => {
    const { tableName, head } = setupTable();

    const db = new Database(tableName, dbPath);
    const table = db.createOrGetTable(tableName, head);

    expect(table.columns).toEqual(expect.arrayContaining(head));
  });
});

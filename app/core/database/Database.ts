import * as path from "path";
import Table from "./Table.js";
import type { FileSystemI } from "../lib/fileSystem.js";
import { createArrFromCSVLine, createCSVRow } from "./utils.js";

export class Database {
  private databaseName: string;
  private dbDirPath: string;
  private tables: { [key: string]: Table<string[]> } = {};
  private fs: FileSystemI;

  constructor(databaseName: string, dbDirPath: string, fs: FileSystemI) {
    this.databaseName = databaseName;
    this.dbDirPath = dbDirPath;
    this.fs = fs;
    this.load();
  }

  public createOrGetTable<ColumnTypes extends readonly string[]>(
    tableName: string,
    columns: [...ColumnTypes]
  ): Table<typeof columns> {
    if (this.tables[tableName]) {
      return this.tables[tableName] as Table<typeof columns>;
    }

    const tableFilePath = path.join(this.dbDirPath, `${tableName}.csv`);

    const table = new Table(tableName, tableFilePath, columns, this.fs);
    const header = createCSVRow(table.columns);

    if (this.fs.existsSync(tableFilePath)) {
      this.fs.writeFileSync(tableFilePath, header);
    }

    this.tables[tableName] = table;

    return table;
  }

  public deleteTable(name: string) {
    const table = this.findTable(name);

    if (!table) {
      throw new Error("Table does'not exist.");
    }
    delete this.tables[table.tableName];
    this.fs.unlinkSync(table.tablePath);
  }

  public listTables(): string[] {
    return Object.keys(this.tables);
  }

  private findTable(name: string) {
    return this.tables[name];
  }

  private load() {
    try {
      this.fs.accessSync(this.dbDirPath);
    } catch {
      this.fs.mkdirSync(this.dbDirPath);
    } finally {
      const files = this.fs.readdirSync(this.dbDirPath);
      for (const file of files) {
        const tableName = path.basename(file, ".csv");
        const tablePath = path.join(this.dbDirPath, file);
        const fd = this.fs.openSync(tablePath, "r");

        try {
          const buffer = Buffer.alloc(512);
          let bytesRead = this.fs.readSync(fd, buffer, 0, buffer.length, 0);
          let data = buffer.subarray(0, bytesRead).toString();

          const newLineIndex = data.indexOf("\n");

          if (newLineIndex !== -1) {
            const rawColumns = data.substring(0, newLineIndex);
            const columns = createArrFromCSVLine(rawColumns);
            const table = new Table(tableName, tablePath, columns, this.fs);
            this.tables[tableName] = table;
          }
        } finally {
          this.fs.closeSync(fd);
        }
      }
    }
  }
}

import * as fsSync from "fs";
import * as path from "path";
import Table from "./_Table.js";
import { createArrFromCSVLine, createCSVRow } from "./_utils.js";

export class Database {
  private databaseName: string;
  private dbDirPath: string;
  private tables: { [key: string]: Table<string[]> } = {};

  constructor(databaseName: string, dbDirPath: string) {
    this.databaseName = databaseName;
    this.dbDirPath = dbDirPath;
    this.load();
  }

  public createOrGetTable<ColumnTypes extends readonly string[]>(
    tableName: string,
    columns: [...ColumnTypes]
  ): Table<typeof columns> {
    const tableFilePath = path.join(this.dbDirPath, `${tableName}.csv`);
    const header = createCSVRow(columns);

    if (this.tables[tableName]) {
      return this.tables[tableName] as Table<typeof columns>;
    }

    if (!fsSync.existsSync(tableFilePath)) {
      fsSync.writeFileSync(tableFilePath, header);
    }

    const table = new Table(tableName, tableFilePath, columns);
    this.tables[tableName] = table;
    return table;
  }

  public deleteTable(name: string) {
    const table = this.findTable(name);

    if (!table) {
      throw new Error("Table does'not exist.");
    }
    delete this.tables[table.tableName];
    fsSync.unlinkSync(table.tablePath);
  }

  public listTables(): string[] {
    return Object.keys(this.tables);
  }

  private findTable(name: string) {
    return this.tables[name];
  }

  private load() {
    try {
      fsSync.accessSync(this.dbDirPath);
    } catch {
      fsSync.mkdirSync(this.dbDirPath);
    } finally {
      const files = fsSync.readdirSync(this.dbDirPath);
      for (const file of files) {
        const tableName = path.basename(file, ".csv");
        const tablePath = path.join(this.dbDirPath, file);
        const fd = fsSync.openSync(tablePath, "r");

        try {
          const buffer = Buffer.alloc(512);
          let bytesRead = fsSync.readSync(fd, buffer, 0, buffer.length, 0);
          let data = buffer.subarray(0, bytesRead).toString();

          const newLineIndex = data.indexOf("\n");

          if (newLineIndex !== -1) {
            const rawColumns = data.substring(0, newLineIndex);
            const columns = createArrFromCSVLine(rawColumns);
            const table = new Table(tableName, tablePath, columns);
            this.tables[tableName] = table;
          }
        } finally {
          fsSync.closeSync(fd);
        }
      }
    }
  }
}

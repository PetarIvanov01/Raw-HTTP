import fsSync from "fs";
import fs from "fs/promises";
import readFileInChunks from "../utils/readFileInChunks";
import { createCSVRow, createObjFromCSVLine } from "./_utils";

type Row<Columns extends readonly string[]> = {
  [Key in Columns[number]]: string;
};

export default class Table<Columns extends readonly string[]> {
  public tableName: string;
  public tablePath: string;
  public columns: [...Columns];

  public tableSize: number;

  constructor(tableName: string, tablePath: string, columns: [...Columns]) {
    this.tableName = tableName;
    this.tablePath = tablePath;
    this.columns = columns;
    this.tableSize = Buffer.byteLength(createCSVRow(columns));
    this.load();
  }

  public async createRow(row: Row<Columns>) {
    const csvRow = createCSVRow(this.columns.map((e) => row[e]));
    this.tableSize += Buffer.byteLength(csvRow);
    await fs.appendFile(this.tablePath, csvRow);
  }

  public async deleteRow() {
    // Find the row
    // Delete it
    // Update the size
  }

  public async findRow(options: { where: Partial<Row<Columns>> }) {
    let foundedRow: undefined | Row<Columns>;
    const queries = Object.entries(options.where);

    if (queries.length === 0) {
      return undefined;
    }
    const findCallback = (line: string, start: number, end: number) => {
      const rowInObj = createObjFromCSVLine(line, this.columns);

      const isMatch = queries.every(
        ([key, value]) => rowInObj[key as Columns[number]] === value
      );

      if (isMatch) {
        foundedRow = rowInObj;
        return true;
      }
      return false;
    };

    const startFrom = Buffer.byteLength(createCSVRow(this.columns));

    const readear = readFileInChunks(startFrom);
    await readear(this.tablePath, 1024, findCallback);

    return foundedRow;
  }

  private async findRowByteRange(row: Partial<Row<Columns>>) {
    const startFrom = Buffer.byteLength(createCSVRow(this.columns));
    const queries = Object.entries(row);

    let byteRange:
      | {
          start: number;
          end: number;
        }
      | undefined;

    const findCallback = (line: string, start: number, end: number) => {
      const rowInObj = createObjFromCSVLine(line, this.columns);

      const isMatch = queries.every(
        ([key, value]) => rowInObj[key as Columns[number]] === value
      );

      if (isMatch) {
        byteRange = {
          start,
          // It is two bytes because the /n is 10 in decimal base
          end: end - 2,
        };
        return true;
      }
      return false;
    };

    const reader = readFileInChunks(startFrom);
    await reader(this.tablePath, 1024, findCallback);

    return byteRange;
  }

  private async getRowByByteRange(byteRange: { start: number; end: number }) {
    const fd = await fs.open(this.tablePath);
    try {
      const stream = fd.createReadStream({ ...byteRange });
      let data = "";

      return await new Promise((res, rej) => {
        stream.on("data", (chunk) => {
          data += chunk;
        });

        stream.on("error", (err) => {
          rej(err);
        });

        stream.on("close", () => {
          const result = createObjFromCSVLine(data, this.columns);
          res(result);
        });
      });
    } finally {
      fd.close();
    }
  }

  private load() {
    try {
      fsSync.accessSync(this.tablePath);
    } catch (error) {
      fsSync.writeFileSync(this.tableName, "");
    } finally {
      const stat = fsSync.statSync(this.tablePath);
      this.tableSize = stat.size;
    }
  }
}

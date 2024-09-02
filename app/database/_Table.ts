import type { FileSystemI } from "../lib/fileSystem.js";
import readFileInChunks from "../utils/readFileInChunks.js";
import { createCSVRow, createObjFromCSVLine } from "./_utils.js";

type Row<Columns extends readonly string[]> = {
  [Key in Columns[number]]: string;
};

type ReturnedRow<Columns extends readonly string[]> = Row<Columns> & {
  id: string;
};
type ColumnsWithInternalId<Columns extends readonly string[]> = [
  "id",
  ...Columns
];

export default class Table<Columns extends readonly string[]> {
  public tableName: string;
  public tablePath: string;
  public columns: ColumnsWithInternalId<Columns>;

  public tableSize: number;
  private _idCounter: number;
  private defaultRowCount = 10;
  private fs: FileSystemI;

  constructor(
    tableName: string,
    tablePath: string,
    columns: [...Columns],
    fs: FileSystemI
  ) {
    this._idCounter = 0;
    this.tableName = tableName;
    this.tablePath = tablePath;
    this.columns = columns.includes("id")
      ? (columns as any)
      : ["id", ...columns];
    this.fs = fs;
    this.tableSize = Buffer.byteLength(createCSVRow(columns));
    this.loadSync();
  }

  public async createRow(row: Row<Columns>) {
    const id = this.generateId();

    const rowWithId: ReturnedRow<Columns> = { id, ...row };
    const csvRow = createCSVRow(this.columns.map((e) => rowWithId[e]));

    await this.fs.appendFile(this.tablePath, csvRow);

    this.tableSize += Buffer.byteLength(csvRow);

    return rowWithId;
  }

  public async deleteRow(options: { where: Partial<Row<Columns>> }) {
    const byteRange = await this.findRowByteRange(options.where);

    if (!byteRange) {
      throw new Error("Row doesn't exist in the table");
    }

    // Delete it
    // Update the size
  }

  public async fetchRows(
    rowCount = this.defaultRowCount
  ): Promise<Array<Row<ColumnsWithInternalId<Columns>>>> {
    let rows: Array<Row<ColumnsWithInternalId<Columns>>> = [];

    const findCallback = (line: string) => {
      const rowInObj = createObjFromCSVLine(line, this.columns);

      if (rows.length >= rowCount) {
        return true;
      }

      rows.push(rowInObj);
      return false;
    };

    const startFrom = Buffer.byteLength(createCSVRow(this.columns));

    const reader = readFileInChunks(startFrom);
    await reader(this.tablePath, 1024, findCallback);

    return rows;
  }

  public async fetchOneRow(options: {
    where: Partial<Row<ColumnsWithInternalId<Columns>>>;
  }) {
    let foundedRow: undefined | Row<ColumnsWithInternalId<Columns>>;
    const queries = Object.entries(options.where);

    if (queries.length === 0) {
      return undefined;
    }
    const findCallback = (line: string, start: number, end: number) => {
      const rowInObj = createObjFromCSVLine(
        line,
        this.columns
      ) as ReturnedRow<Columns>;

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

  private async findRowByteRange(
    row: Partial<Row<ColumnsWithInternalId<Columns>>>
  ) {
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
        ([key, value]) =>
          rowInObj[key as ColumnsWithInternalId<Columns>[number]] === value
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
    const fd = await this.fs.open(this.tablePath);
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

  private generateId() {
    return (++this._idCounter).toString(); // Simple ID generation logic
  }

  private loadSync() {
    try {
      this.fs.accessSync(this.tablePath);

      const fileContent = this.fs.readFileSync(this.tablePath, "utf-8");
      const lines = fileContent.split("\n").slice(1);

      for (const line of lines) {
        if (line.trim()) {
          const idIndex = line.indexOf(",");
          const id = line.substring(0, idIndex);
          if (id) {
            const parsedId = parseInt(id, 10);
            if (!isNaN(parsedId)) {
              this._idCounter++;
            }
          }
        }
      }

      this.tableSize = fileContent.length;

      if (process.env.NODE_ENV?.includes("dev")) {
        console.log("---Development stuff---");
        console.log("Table size: ", this.tableSize);
        console.log("Last Internal id: ", this._idCounter);
        console.log("-----------------------");
      }
    } catch (err) {
      this._idCounter = 0;
      this.fs.writeFileSync(this.tablePath, "");
    } finally {
      const stat = this.fs.statSync(this.tablePath, { throwIfNoEntry: true });
      if (stat) {
        this.tableSize = stat.size;
      }
    }
  }
}

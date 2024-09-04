import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "path";

export const customFileSystem = {
  accessSync: fs.accessSync,
  writeFileSync: fs.writeFileSync,
  appendFileSync: fs.appendFileSync,
  statSync: fs.statSync,
  readFileSync: fs.readFileSync,
  existsSync: fs.existsSync,
  unlinkSync: fs.unlinkSync,
  mkdirSync: fs.mkdirSync,
  readdirSync: fs.readdirSync,
  openSync: fs.openSync,
  readSync: fs.readSync,
  closeSync: fs.closeSync,
  rmSync: _,
  // Asynchronous methods
  readDir: fsPromises.readdir,
  appendFile: fsPromises.appendFile,
  readFile: fsPromises.readFile,
  access: fsPromises.access,
  stat: fsPromises.stat,
  open: fsPromises.open,
};

function _(dirPath: string) {
  const files = customFileSystem.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    customFileSystem.unlinkSync(filePath);
  }
  fs.rmSync(dirPath, { force: true, recursive: true });
}

export type FileSystemI = typeof customFileSystem;

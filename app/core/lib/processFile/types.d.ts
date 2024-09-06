export type ReaderCallback = (
  line: string,
  start: number,
  end: number
) => boolean;
export type ReaderType = (
  filePath: string,
  chunkSize: number,
  callback: ReaderCallback
) => Promise<void>;

export type UpdaterCallback = (line: string) => string | null;
export type UpdaterType = (
  filePath: string,
  callback: UpdaterCallback
) => Promise<void>;

export type DeleterCallback = (
  line: string,
  start: number,
  end: number
) => boolean;
export type DeleterType = (
  filePath: string,
  chunkSize: number,
  callback: DeleterCallback
) => Promise<void>;

export type Operation = "read" | "update" | "delete";

export type PartialRow = Partial<{
  id: string;
  stage: string;
  user: string;
  title: string;
  description: string;
  createdAt: string;
}>;

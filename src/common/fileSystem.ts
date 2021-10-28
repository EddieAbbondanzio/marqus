export type FileSystemAction =
  | "readDirectory"
  | "createDirectory"
  | "deleteDirectory"
  | "writeFile"
  | "readFile"
  | "deleteFile";

export type FileContentType = "text" | "json";

export interface FileSystemParameters {
  path: string;
}

export interface FileSystemReadFile extends FileSystemParameters {
  contentType: FileContentType;
}

export interface FileSystemWriteFile extends FileSystemParameters {
  content: any;
  contentType: FileContentType;
}

export interface FileSystemIpc<T = FileSystemParameters> {
  action: FileSystemAction;
  value: T;
}

export interface FileSystem {
  createDirectory(path: string): Promise<void>;
  readJSON(path: string): Promise<any>;
  readDirectory(path: string): Promise<string[]>;
  writeJSON(path: string, content: any): Promise<void>;
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
}

export const DATA_DIRECTORY = "data";

export type FileSystemAction =
  | "exists"
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

export const DATA_DIRECTORY = "data";

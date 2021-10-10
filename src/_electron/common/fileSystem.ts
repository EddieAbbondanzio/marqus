export type FileSystemAction =
  | "exists"
  | "readDirectory"
  | "createDirectory"
  | "deleteDirectory"
  | "writeFile"
  | "readFile"
  | "deleteFile";

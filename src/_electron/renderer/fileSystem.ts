import fs from "fs";
import * as p from "path";
import { FileSystemAction } from "..";
import { sendIpc } from "./preload";

export const DATA_DIRECTORY = "data";

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

export const fileSystem = {
  async createDirectory(p: string, { root = false } = {}): Promise<void> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc = {
      action: "createDirectory",
      value: { path },
    };

    await sendIpc("fileSystem", ipc);
  },
  async exists(p: string, { root = false } = {}): Promise<boolean> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc = {
      action: "exists",
      value: { path },
    };

    return sendIpc<boolean>("fileSystem", ipc);
  },
  async readJSON(p: string, { root = false } = {}): Promise<any> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc<FileSystemReadFile> = {
      action: "readFile",
      value: { path, contentType: "json" },
    };

    const json = await sendIpc<any>("fileSystem", ipc);
    return json;
  },
  async readDirectory(p: string, { root = false } = {}): Promise<string[]> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc = {
      action: "readDirectory",
      value: { path },
    };

    const files = await sendIpc<string[]>("fileSystem", ipc);
    return files;
  },
  async writeJSON(
    p: string,
    content: any,
    { root = false } = {}
  ): Promise<void> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc<FileSystemWriteFile> = {
      action: "writeFile",
      value: { path, content, contentType: "json" },
    };

    await sendIpc("fileSystem", ipc);
  },
  async readText(p: string, { root = false } = {}): Promise<string> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc<FileSystemReadFile> = {
      action: "readFile",
      value: { path, contentType: "text" },
    };

    const text = await sendIpc<string>("fileSystem", ipc);
    return text;
  },
  async writeText(
    p: string,
    content: string,
    { root = false } = {}
  ): Promise<void> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc<FileSystemWriteFile> = {
      action: "writeFile",
      value: { path, content, contentType: "text" },
    };

    await sendIpc("fileSystem", ipc);
  },
  async deleteDirectory(p: string, { root = false } = {}): Promise<void> {
    const path = generateFullPath(p, root);

    const ipc: FileSystemIpc = {
      action: "deleteDirectory",
      value: { path },
    };

    await sendIpc("fileSystem", ipc);
  },
};

export function generateFullPath(path: string, root: boolean): string {
  return !root ? p.join(DATA_DIRECTORY, path) : path;
}

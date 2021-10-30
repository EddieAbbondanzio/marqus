import {
  FileSystem,
  FileSystemIpc,
  FileSystemReadFile,
  FileSystemWriteFile,
} from "../../common/ipc/fileSystem";
import { IpcPlugin } from "../../common/ipc/ipc";

export const fileSystemPlugin: IpcPlugin<FileSystem> = (sendIpc) => ({
  async createDirectory(path: string): Promise<void> {
    const ipc: FileSystemIpc = {
      action: "createDirectory",
      value: { path },
    };

    await sendIpc("fileSystem", ipc);
  },
  async readJSON(path: string): Promise<any> {
    const ipc: FileSystemIpc<FileSystemReadFile> = {
      action: "readFile",
      value: { path, contentType: "json" },
    };

    const json = await sendIpc("fileSystem", ipc);
    return json;
  },
  async readDirectory(path: string): Promise<string[]> {
    const ipc: FileSystemIpc = {
      action: "readDirectory",
      value: { path },
    };

    const files = await sendIpc("fileSystem", ipc);
    return files;
  },
  async writeJSON(path: string, content: any): Promise<void> {
    const ipc: FileSystemIpc<FileSystemWriteFile> = {
      action: "writeFile",
      value: { path, content, contentType: "json" },
    };

    await sendIpc("fileSystem", ipc);
  },
  async readText(path: string): Promise<string> {
    const ipc: FileSystemIpc<FileSystemReadFile> = {
      action: "readFile",
      value: { path, contentType: "text" },
    };

    const text = await sendIpc("fileSystem", ipc);
    return text;
  },
  async writeText(path: string, content: string): Promise<void> {
    const ipc: FileSystemIpc<FileSystemWriteFile> = {
      action: "writeFile",
      value: { path, content, contentType: "text" },
    };

    await sendIpc("fileSystem", ipc);
  },
  async deleteDirectory(path: string): Promise<void> {
    const ipc: FileSystemIpc = {
      action: "deleteDirectory",
      value: { path },
    };

    await sendIpc("fileSystem", ipc);
  },
});

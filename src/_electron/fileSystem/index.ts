import fs from "fs";
import p from "path";
import { IpcHandler, IpcPlugin } from "..";
import {
  FileSystemIpc,
  FileContentType,
  DATA_DIRECTORY,
  FileSystem,
  FileSystemReadFile,
  FileSystemWriteFile,
} from "./types";

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

export const fileSystemHandler: IpcHandler<FileSystemIpc<any>> = async (
  opts
) => {
  const path = generateFullPath(opts.value.path);

  switch (opts.action) {
    case "createDirectory":
      return createDirectory(path);
    case "deleteDirectory":
      return deleteDirectory(path);
    case "readDirectory":
      return readDirectory(path);
    case "deleteFile":
      return deleteFile(path);
    case "readFile":
      return readFile(path, opts.value.contentType);
    case "writeFile":
      return writeFile(path, opts.value.content, opts.value.contentType);
  }
};

async function createDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.mkdir(path, (err) => (err != null ? rej(err) : res()));
  });
}

async function deleteDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rmdir(path, (err) => (err != null ? rej(err) : res()));
  });
}

async function readDirectory(path: string): Promise<string[]> {
  return new Promise((res, rej) => {
    fs.readdir(path, (err, files) => {
      if (err != null) {
        return rej(err);
      }
      return res(files);
    });
  });
}

async function deleteFile(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rm(path, (err) => (err != null ? rej(err) : res()));
  });
}

async function readFile(
  path: string,
  contentType: FileContentType
): Promise<any> {
  return new Promise((res, rej) => {
    fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
      if (err != null) {
        return rej(err);
      }

      if (contentType === "json") {
        if (data == null || data.length === 0) {
          res(null);
        } else {
          return JSON.parse(data);
        }
      } else {
        res(data);
      }
    });
  });
}

async function writeFile(
  path: string,
  content: any,
  contentType: FileContentType
): Promise<void> {
  return new Promise((res, rej) => {
    let data: string = content;

    if (contentType === "json") {
      data = JSON.stringify(content);
    }

    fs.writeFile(path, data, { encoding: "utf-8" }, (err) =>
      err != null ? rej(err) : res()
    );
  });
}

export function generateFullPath(path: string): string {
  return p.join(DATA_DIRECTORY, path);
}

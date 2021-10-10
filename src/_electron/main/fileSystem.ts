import { IpcHandler } from ".";
import { FileContentType, FileSystemIpc } from "..";
import fs from "fs";

export const fileSystem: IpcHandler<FileSystemIpc<any>> = async (opts) => {
  const { path } = opts.value;

  switch (opts.action) {
    case "createDirectory":
      return fs.mkdirSync(path);
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
    case "exists":
      return fs.existsSync(path);
  }
};

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

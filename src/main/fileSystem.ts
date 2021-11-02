import * as p from "path";
import * as fs from "fs";

export const DATA_DIRECTORY = "data";
export type FileContentType = "text" | "json";

export async function createDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.mkdir(path, (err) => (err != null ? rej(err) : res()));
  });
}

export async function deleteDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rmdir(path, (err) => (err != null ? rej(err) : res()));
  });
}

export async function readDirectory(path: string): Promise<string[]> {
  return new Promise((res, rej) => {
    fs.readdir(path, (err, files) => {
      if (err != null) {
        return rej(err);
      }
      return res(files);
    });
  });
}

export async function deleteFile(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rm(path, (err) => (err != null ? rej(err) : res()));
  });
}

export async function readFile(
  path: string,
  contentType: "json"
): Promise<{} | null>;
export async function readFile(
  path: string,
  contentType: "text"
): Promise<string | null>;
export async function readFile(
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

export async function writeFile(
  path: string,
  content: {},
  contentType: "json"
): Promise<void>;
export async function writeFile(
  path: string,
  content: string,
  contentType: "text"
): Promise<void>;
export async function writeFile(
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

export function generateFullPath(...path: string[]): string {
  return p.join(DATA_DIRECTORY, ...path);
}

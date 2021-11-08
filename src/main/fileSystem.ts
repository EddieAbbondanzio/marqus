import * as p from "path";
import * as fs from "fs";

export const DATA_DIRECTORY = "data";
export type FileContentType = "text" | "json";

export function fileExists(path: string): boolean {
  const fullPath = generateFullPath(path);
  return fs.existsSync(fullPath);
}

export async function createDirectory(path: string): Promise<void> {
  const fullPath = generateFullPath(path);

  return new Promise((res, rej) => {
    fs.mkdir(fullPath, (err) => (err != null ? rej(err) : res()));
  });
}

export async function deleteDirectory(path: string): Promise<void> {
  const fullPath = generateFullPath(path);

  return new Promise((res, rej) => {
    fs.rmdir(fullPath, (err) => (err != null ? rej(err) : res()));
  });
}

export async function readDirectory(path: string): Promise<string[]> {
  const fullPath = generateFullPath(path);

  return new Promise((res, rej) => {
    fs.readdir(fullPath, (err, files) => {
      if (err != null) {
        return rej(err);
      }
      return res(files);
    });
  });
}

export async function deleteFile(path: string): Promise<void> {
  const fullPath = generateFullPath(path);

  return new Promise((res, rej) => {
    fs.rm(fullPath, (err) => (err != null ? rej(err) : res()));
  });
}

export async function readFile(
  path: string,
  contentType: "json"
): Promise<unknown | null>;
export async function readFile(
  path: string,
  contentType: "text"
): Promise<string | null>;
export async function readFile(
  path: string,
  contentType: FileContentType
): Promise<any> {
  const fullPath = generateFullPath(path);
  if (!fileExists(fullPath)) {
    console.log(`readFile(): File ${fullPath} did not exist.`);
    return;
  }

  return new Promise((res, rej) => {
    fs.readFile(fullPath, { encoding: "utf-8" }, (err, data) => {
      if (err != null) {
        return rej(err);
      }

      if (contentType === "json") {
        if (data == null || data.length === 0) {
          res(null);
        } else {
          res(JSON.parse(data));
        }
      } else {
        res(data);
      }
    });
  });
}

export async function writeFile(
  path: string,
  content: unknown,
  contentType: "json"
): Promise<void>;
export async function writeFile(
  path: string,
  content: string,
  contentType: "text"
): Promise<void>;
export async function writeFile(
  path: string,
  content: string | unknown,
  contentType: FileContentType
): Promise<void> {
  const fullPath = generateFullPath(path);

  return new Promise((res, rej) => {
    let data: string;

    if (contentType === "json") {
      data = JSON.stringify(content);
    } else {
      data = content as string;
    }

    fs.writeFile(fullPath, data, { encoding: "utf-8" }, (err) =>
      err != null ? rej(err) : res()
    );
  });
}

export function generateFullPath(...path: string[]): string {
  return p.resolve(DATA_DIRECTORY, ...path);
}

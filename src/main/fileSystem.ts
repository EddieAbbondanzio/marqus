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

export type ContentType = "json" | "text";
export type ReadOpts = { required: boolean };
export async function readFile<
  Content extends ContentType,
  Opts extends ReadOpts
>(
  path: string,
  contentType: Content,
  opts?: Opts
): Promise<
  Content extends "json"
    ? any
    : Opts extends { required: true }
    ? string
    : string | null
> {
  return new Promise((res, rej) => {
    const fullPath = generateFullPath(path);

    if (!fileExists(fullPath)) {
      if (opts?.required) {
        return res(null as any);
      }

      throw Error(`readFile(): File ${fullPath} did not exist.`);
    }

    fs.readFile(fullPath, { encoding: "utf-8" }, (err, data) => {
      if (err != null) {
        return rej(err);
      }

      if (contentType === "json") {
        if (data == null || data.length === 0) {
          res(null as any);
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
  return new Promise((res, rej) => {
    const fullPath = generateFullPath(path);
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

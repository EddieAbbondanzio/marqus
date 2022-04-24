import * as fs from "fs";

export type FileContentType = "text" | "json";

export function exists(path: string): boolean {
  return fs.existsSync(path);
}

export async function createDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.mkdir(path, (err) => (err != null ? rej(err) : res()));
  });
}

export async function deleteDirectory(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rm(path, { recursive: true }, (err) => (err != null ? rej(err) : res()));
  });
}

export async function readDirectory(path: string): Promise<fs.Dirent[]> {
  return new Promise((res, rej) => {
    fs.readdir(path, { withFileTypes: true }, (err, files) => {
      if (err != null) {
        return rej(err);
      }
      return res(files);
    });
  });
}

export async function stat(path: string): Promise<fs.Stats> {
  return new Promise((res, rej) => {
    fs.stat(path, (err, stats) => {
      if (err != null) {
        rej(err);
      } else {
        return res(stats);
      }
    });
  });
}

export async function deleteFile(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.rm(path, (err) => (err != null ? rej(err) : res()));
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
    if (!exists(path)) {
      if (!(opts?.required ?? false)) {
        return res(null as any);
      }

      throw Error(`readFile(): File ${path} did not exist.`);
    }

    fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
      if (err != null) {
        return rej(err);
      }

      if (contentType === "json") {
        if (data == null || data.length === 0) {
          res(null as any);
        } else {
          try {
            const json = JSON.parse(data);
            res(json);
          } catch (e) {
            const { message } = e;
            (e as Error).message = `Cannot load file ${path}:\n${message}`;
            rej(e);
          }
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
  switch (contentType) {
    case "json":
      if (typeof content !== "object" && typeof content !== "string") {
        console.warn(
          `${contentType} file content must be a string or object. Content passed: ${content}`
        );
        throw Error(`${contentType} file content must be a string or object.`);
      }
      break;
    case "text":
      if (typeof contentType !== "string") {
        console.error(
          `${contentType} file content must be a string. Content passed: ${content}`
        );
        throw Error(`${contentType} file content must be a string.`);
      }
      break;
  }

  return new Promise((res, rej) => {
    let data: string;

    if (contentType === "json") {
      data = JSON.stringify(content);
    } else {
      data = content as string;
    }

    fs.writeFile(path, data, { encoding: "utf-8" }, (err) =>
      err != null ? rej(err) : res()
    );
  });
}

export async function touch(path: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.open(path, "w", (openErr, fd) => {
      if (openErr) {
        return rej(openErr);
      } else {
        fs.close(fd, (closeErr) => {
          if (closeErr) {
            return rej(closeErr);
          } else {
            res();
          }
        });
      }
    });
  });
}

import * as p from "path";
import * as fs from "fs";
import { debounce, isEqual, cloneDeep } from "lodash";
import { getNodeEnv } from "../shared/env";
import * as yup from "yup";

export const DATA_DIRECTORY = "data";
export type FileContentType = "text" | "json";

export type FileName =
  | "tags.json"
  | "notebooks.json"
  | "shortcuts.json"
  | "app.json";

function isValidFileName(fileName: FileName) {
  return (
    fileName === "tags.json" ||
    fileName === "notebooks.json" ||
    fileName === "app.json" ||
    fileName === "shortcuts.json"
  );
}

interface FileHandler<Content> {
  save(content: Content): Promise<Content>;
  load(): Promise<Content>;
}

const DEBOUNCE_INTERVAL_MS = 250;

export function createFileHandler<Content>(
  /**
   * The name of the file. Should include extension (.json)
   */
  name: FileName,
  /**
   * Validation occurs before saving file contents, and after deserializing
   * when loading file contents
   */
  schema: yup.AnySchema,
  opts?: {
    /**
     * Return value in the event the file was empty or not found.
     */
    defaultValue?: Content;
    /**
     * Convert the content of the file before saving it.
     */
    serialize?: (c: Content) => any;
    /**
     * Parse the content of the file after loading it.
     */
    deserialize?: (c?: any) => Content | undefined;
  }
): FileHandler<Content> {
  if (!isValidFileName(name)) {
    throw Error(`Invalid file name ${name}`);
  }

  let previous: Content;

  const save: any = debounce(async (content?: Content): Promise<Content> => {
    if (content == null) {
      throw Error(`${name} file content cannot be null.`);
    }

    if (previous != null && isEqual(content, previous)) {
      return content;
    }

    await schema.validate(content);

    let c;
    if (opts?.serialize != null) {
      c = opts.serialize(content);
    } else {
      c = content;
    }

    await writeFile(name, c, "json");
    previous = cloneDeep(content);

    return content;
  }, DEBOUNCE_INTERVAL_MS);

  const load = async () => {
    // File will never change unless we save it, so we can return cached state.
    if (previous != null) {
      return previous;
    }
    const content = await readFile(name, "json");

    let c;
    if (opts?.deserialize != null) {
      c = opts.deserialize(content);
    } else {
      c = content;
    }

    if (c != null) {
      try {
        await schema.validate(c);
      } catch (e) {
        if (getNodeEnv() === "development") {
          console.log("Failed validation: ", JSON.stringify(c));
        }

        throw e;
      }
    } else {
      c = opts?.defaultValue;
    }

    if (c == null) {
      throw Error(
        `Content for ${name} was null and no default value was provided.`
      );
    }

    return c;
  };

  return {
    save,
    load,
  };
}

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
      if (!(opts?.required ?? false)) {
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

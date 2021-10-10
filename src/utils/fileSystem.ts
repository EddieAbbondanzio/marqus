import fs from "fs";
import * as p from "path";

/**
 * Folder that will be defaulted to when loading / saving files.
 */
export const DATA_DIRECTORY = "data";

/**
 * Helper for reading and writing files to the user's file system.
 */
export const fileSystem = {
  /**
   * Write a JSON file to the file system.
   * @param path The path to write to.
   * @param content The content of the file to store as JSON.
   * @param options If the path should be defaulted under the data directory
   */
  async writeJSON(
    path: string,
    content: any,
    { root = false } = {}
  ): Promise<void> {
    const fullPath = generateFullPath(path, root);
    const json = JSON.stringify(content);

    return new Promise<void>((res, rej) =>
      fs.writeFile(fullPath, json, { encoding: "utf-8" }, (err) =>
        err != null ? rej(err) : res()
      )
    );
  },
  async readText(path: string, { root = false } = {}): Promise<string> {
    const fullPath = generateFullPath(path, root);

    return new Promise((res, rej) =>
      fs.readFile(fullPath, { encoding: "utf-8" }, (err, data) =>
        err != null ? rej(err) : res(data)
      )
    );
  },
  async writeText(
    path: string,
    content: string,
    { root = false } = {}
  ): Promise<void> {
    const fullPath = generateFullPath(path, root);

    return new Promise<void>((res, rej) =>
      fs.writeFile(fullPath, content, { encoding: "utf-8" }, (err) =>
        err != null ? res() : rej(err)
      )
    );
  },
  async deleteDirectory(path: string, { root = false } = {}): Promise<void> {
    const fullPath = generateFullPath(path, root);

    return new Promise<void>((res, rej) =>
      fs.rmdir(fullPath, (err) => (err != null ? rej(err) : res()))
    );
  },
};

export function generateFullPath(path: string, root: boolean): string {
  return !root ? p.join(DATA_DIRECTORY, path) : path;
}

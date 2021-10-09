// import fs from "fs";
// import * as p from "path";

// /**
//  * Folder that will be defaulted to when loading / saving files.
//  */
// export const DATA_DIRECTORY = "data";

// /**
//  * Helper for reading and writing files to the user's file system.
//  */
// export const fileSystem = {
//   /**
//    * Create a new directory at the specified path.
//    * @param path The path of the directory
//    * @param options If the path should be defaulted under the data directory
//    */
//   createDirectory(path: string, { root = false } = {}) {
//     const fullPath = generateFullPath(path, root);
//     fs.mkdirSync(fullPath);
//   },
//   /**
//    * Check to see if a directory or file exists.
//    * @param path The path to check for
//    * @param options If the path should be defaulted under the data directory
//    */
//   exists(path: string, { root = false } = {}) {
//     const fullPath = generateFullPath(path, root);
//     return fs.existsSync(fullPath);
//   },
//   /**
//    * Read a JSON file from the file system.
//    * @param path The path to read.
//    * @param options If the path should be defaulted under the data directory
//    */
//   async readJSON(path: string, { root = false } = {}): Promise<any> {
//     return null;
//   },
//   /**
//    * Read all of the directories / files under a directory.
//    * @param path The path to read.
//    * @param options If the path should be defaulted under the data directory
//    * @returns List of directory or file names.
//    */
//   async readDirectory(path: string, { root = false } = {}): Promise<string[]> {
//     const fullPath = generateFullPath(path, root);

//     return new Promise((res, rej) =>
//       fs.readdir(fullPath, (err, files) =>
//         err == null ? res(files) : rej(err)
//       )
//     );
//   },
//   /**
//    * Write a JSON file to the file system.
//    * @param path The path to write to.
//    * @param content The content of the file to store as JSON.
//    * @param options If the path should be defaulted under the data directory
//    */
//   async writeJSON(path: string, content: any, { root = false } = {}) {
//     const fullPath = generateFullPath(path, root);
//     const json = JSON.stringify(content);

//     return new Promise<void>((res, rej) =>
//       fs.writeFile(fullPath, json, { encoding: "utf-8" }, err =>
//         err != null ? rej(err) : res()
//       )
//     );
//   },
//   async readText(path: string, { root = false }) {
//     const fullPath = generateFullPath(path, root);

//     return new Promise((res, rej) =>
//       fs.readFile(fullPath, { encoding: "utf-8" }, (err, data) =>
//         err != null ? rej(err) : res(data)
//       )
//     );
//   },
//   async writeText(path: string, content: string, { root = false } = {}) {
//     const fullPath = generateFullPath(path, root);

//     return new Promise<void>((res, rej) =>
//       fs.writeFile(fullPath, content, { encoding: "utf-8" }, err =>
//         err != null ? res() : rej(err)
//       )
//     );
//   },
//   async deleteDirectory(path: string, { root = false } = {}) {
//     const fullPath = generateFullPath(path, root);

//     return new Promise<void>((res, rej) =>
//       fs.rmdir(fullPath, err => (err != null ? rej(err) : res()))
//     );
//   }
// };

// export function generateFullPath(path: string, root: boolean) {
//   return !root ? p.join(DATA_DIRECTORY, path) : path;
// }

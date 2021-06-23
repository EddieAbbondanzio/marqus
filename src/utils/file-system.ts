import { promises as fs, existsSync, mkdirSync } from 'fs';
import * as p from 'path';

/**
 * Folder that will be defaulted to when loading / saving files.
 */
export const DATA_DIRECTORY = 'data';

/**
 * Helper for reading and writing files to the user's file system.
 */
export const fileSystem = {
    /**
     * Create a new directory at the specified path.
     * @param path The path of the directory
     * @param options If the path should be defaulted under the data directory
     */
    createDirectory(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);
        mkdirSync(fullPath);
    },
    /**
     * Check to see if a directory or file exists.
     * @param path The path to check for
     * @param options If the path should be defaulted under the data directory
     */
    exists(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);
        return existsSync(fullPath);
    },
    /**
     * Read a JSON file from the file system.
     * @param path The path to read.
     * @param options If the path should be defaulted under the data directory
     */
    async readJSON(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);

        const contents = await fs.readFile(fullPath, 'utf8');
        return JSON.parse(contents);
    },
    /**
     * Read all of the directories / files under a directory.
     * @param path The path to read.
     * @param options If the path should be defaulted under the data directory
     * @returns List of directory or file names.
     */
    async readDirectory(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);
        return await fs.readdir(fullPath);
    },
    /**
     * Write a JSON file to the file system.
     * @param path The path to write to.
     * @param content The content of the file to store as JSON.
     * @param options If the path should be defaulted under the data directory
     */
    async writeJSON(path: string, content: any, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);

        const json = JSON.stringify(content);
        await fs.writeFile(fullPath, json, 'utf8');
    },
    async readText(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);
        const contents = await fs.readFile(fullPath, 'utf8');

        return contents;
    },
    async writeText(path: string, content: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);

        await fs.writeFile(fullPath, content, 'utf8');
    },
    async deleteDirectory(path: string, { root }: { root: boolean } = { root: false }) {
        const fullPath = generateFullPath(path, root);
        await fs.rmdir(fullPath, { recursive: true });
    }
};

export function generateFullPath(path: string, root: boolean) {
    return !root ? p.join(DATA_DIRECTORY, path) : path;
}

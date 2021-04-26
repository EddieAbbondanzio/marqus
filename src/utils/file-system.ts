import { promises as fs, existsSync, mkdirSync } from 'fs';

/**
 * Helper for reading and writing files to the user's file system.
 */
export const fileSystem = {
    /**
     * Create a new directory in the file systme.
     * @param path The path of the new directory.
     */
    createDirectory: (path: string) => mkdirSync(path),
    /**
     * Check to see if a directory or file exists.
     * @param path The path to check for
     */
    exists: (path: string) => existsSync(path),
    /**
     * Read a JSON file from the file system.
     * @param path The path to read.
     */
    async readJSON(path: string) {
        const contents = await fs.readFile(path, 'utf8');
        return JSON.parse(contents);
    },
    /**
     * Write a JSON file to the file system.
     * @param path The path to write to.
     * @param content The content of the file to store as JSON.
     */
    async writeJSON(path: string, content: any) {
        const json = JSON.stringify(content);
        await fs.writeFile(path, json, 'utf8');
    }
};

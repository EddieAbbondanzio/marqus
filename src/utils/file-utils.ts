/*eslint-disable*/

import * as fs from 'fs';

export async function loadJsonFile(path: string) {
    const raw = await fs.promises.readFile(path, { encoding: 'utf-8' });
    return JSON.parse(raw);
}

export async function writeJsonFile(path: string, data: any) {
    console.log('writing!');
    const raw = JSON.stringify(data);
    await fs.promises.writeFile(path, raw, { encoding: 'utf-8' });
}

export function doesFileExist(path: string) {
    return fs.existsSync(path);
}

export function createDirectory(path: string) {
    return fs.mkdirSync(path);
}

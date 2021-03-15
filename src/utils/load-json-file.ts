declare global {
    interface Window {
        require: any;
    }
}

/*eslint-disable*/
const fs = window.require('fs');

export async function loadJsonFile(path: string) {
    const raw = await fs.promises.readFile(path, { enconding: 'utf-8' });
    return JSON.parse(raw);
}

export async function writeJsonFile(path: string, data: any) {
    const raw = JSON.stringify(data);
    await fs.promises.writeFile(path, raw, 'utf-8');
}

export async function doesFileExist(path: string) {
    return fs.existsSync(path);
}

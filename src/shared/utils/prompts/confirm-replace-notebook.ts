// eslint-disable-next-line
const electron = require('electron').remote; // Don't change. Jest doesn't like destructuring.

export async function confirmReplaceNotebook(name: string): Promise<boolean> {
    const options: any = {
        type: 'warning',
        buttons: ['Yes', 'No'],
        message: `Notebook with name ${name} already exists in destination. Do you want to replace it?`
    };

    options.defaultId = 0;
    options.cancelId = 1;

    const out = await electron.dialog.showMessageBox(options);
    return out.response === 0; // Index of button clicked. IE: 'Yes'
}

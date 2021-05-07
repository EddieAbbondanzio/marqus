const electron = require('electron').remote; // Don't change. Jest doesn't like destructuring.

export async function confirmDelete(type: string, name: string): Promise<boolean> {
    const options: any = {
        type: 'warning',
        buttons: ['Yes', 'No'],
        message: `Are you sure you want to delete ${type} ${name}`
    };

    options.defaultId = 0;
    options.cancelId = 1;

    const out = await electron.dialog.showMessageBox(options);
    return out.response === 0; // Index of button clicked. IE: 'Yes'
}

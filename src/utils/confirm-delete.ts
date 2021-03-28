const { dialog } = require('electron').remote;

export async function confirmDelete(type: string, name: string): Promise<boolean> {
    const options: any = {
        buttons: ['Yes', 'No'],
        message: `Are you sure you want to delete ${type} ${name}`
    };

    options.defaultId = 0;
    options.cancelId = 1;

    const out = await dialog.showMessageBox(options);
    return out.response === 0; // Index of button clicked. IE: 'Yes'
}

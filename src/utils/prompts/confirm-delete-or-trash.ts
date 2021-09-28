// eslint-disable-next-line
const electron = require('electron').remote; // Don't change. Jest doesn't like destructuring.

export async function confirmDeleteOrTrash(type: string, name: string): Promise<'trash' | 'delete' | 'cancel'> {
    const options: any = {
        type: 'warning',
        buttons: ['Move to Trash', 'Permanently Delete', 'Cancel'],
        message: `Are you sure you want to delete ${type} ${name}`
    };

    options.defaultId = 0;
    options.cancelId = 2;

    const out = await electron.dialog.showMessageBox(options);

    // out.response is index of button user selected.
    switch (out.response) {
        case 0:
            return 'trash';
        case 1:
            return 'delete';
        case 2:
            return 'cancel';
        default:
            throw Error(`Unknown selection made: ${out.response}`);
    }
}

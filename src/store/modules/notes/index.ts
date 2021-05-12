import { Note, NoteState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { fileSystem } from '@/utils/file-system';
import path from 'path';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

persist.register({
    namespace: 'notes',
    initiMutation: 'INIT',
    filter: ['CREATE', 'UPDATE', 'DELETE'],
    async serialize(s: NoteState, { mutationPayload }) {
        switch (mutationPayload.type) {
            case 'notes/CREATE':
            case 'notes/UPDATE':
                await upsertNoteToFileSystem(mutationPayload.payload);
                break;

            case 'notes/DELETE':
                console.log('aayyy lmao. Implement the delete bruh');
                break;
        }
    },
    async deserialize() {
        console.log('FUCK');
    }
});

export async function upsertNoteToFileSystem(note: Note) {
    const directoryPath = `notes/${note.id}`;

    // Create parent directory if needed
    if (!fileSystem.exists(directoryPath)) {
        await fileSystem.createDirectory(directoryPath);
    }

    // Create empty attachment directory if needed
    const attachmentPath = path.join(directoryPath, '/attachments');
    if (!fileSystem.exists(attachmentPath)) {
        await fileSystem.createDirectory(attachmentPath);
    }

    // Create empty index.md if needed.
    const indexPath = path.join(directoryPath, 'index.md');
    if (!fileSystem.exists(indexPath)) {
        await fileSystem.writeText(indexPath, '');
    }

    const json = {
        name: note.name,
        dateCreated: note.dateCreated,
        dateModified: note.dateModified,
        notebooks: note.notebooks,
        tags: note.tags
    };

    await fileSystem.writeJSON(path.join(directoryPath, 'metadata.json'), json);
}

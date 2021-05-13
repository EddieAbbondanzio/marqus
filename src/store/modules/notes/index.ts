import { Note, NoteState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import moment from 'moment';

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

const NOTES_DIRECTORY = 'notes';

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
        const noteDirectories = await fileSystem.readDirectory(NOTES_DIRECTORY);
        const notes = [];

        for (let i = 0; i < noteDirectories.length; i++) {
            const noteId = noteDirectories[i];

            // Regex test what we found to ensure it's actually a note. Not that this is a catch all...
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(noteId)) {
                const metaData = await fileSystem.readJSON(path.join(NOTES_DIRECTORY, noteId, 'metadata.json'));
                const note: Note = {
                    id: noteId,
                    name: metaData.name,
                    dateCreated: moment(metaData.dateCreated).toDate(),
                    dateModified: moment(metaData.dateModified).toDate(),
                    notebooks: metaData.notebooks,
                    tags: metaData.tags
                };

                notes.push(note);
            }
        }

        return {
            values: notes
        };
    }
});

export async function upsertNoteToFileSystem(note: Note) {
    const directoryPath = path.join(NOTES_DIRECTORY, note.id);

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

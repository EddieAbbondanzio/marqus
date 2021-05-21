import { Note, NoteState, state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { persist } from '@/store/plugins/persist/persist';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import moment from 'moment';
import { regex } from '@/utils/regex';
import { MutationPayload } from 'vuex';
import { State } from '@/store/state';

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
    serialize,
    deserialize
});

export async function serialize(
    s: NoteState,
    { rootState, mutationPayload }: { rootState: State; mutationPayload: MutationPayload }
) {
    switch (mutationPayload.type) {
        // id was passed
        case 'notes/CREATE':
        case 'notes/UPDATE':
        case 'notes/MOVE_TO_TRASH':
        case 'notes/RESTORE_TO_TRASH':
        case 'notes/FAVORITE':
        case 'notes/UNFAVORITE':
            await saveNoteToFileSystem(rootState, mutationPayload.payload);
            break;

        case 'notes/ADD_TAG':
        case 'notes/ADD_NOTEBOOK':
        case 'notes/REMOVE_TAG':
        case 'notes/REMOVE_NOTEBOOK':
            await saveNoteToFileSystem(rootState, mutationPayload.payload.noteId);
            break;

        case 'notes/DELETE':
            await fileSystem.deleteDirectory(path.join(NOTES_DIRECTORY, mutationPayload.payload));
            break;

        case 'notes/EMPTY_TRASH':
            await fileSystem.deleteDirectory(NOTES_DIRECTORY);
            await fileSystem.createDirectory(NOTES_DIRECTORY);
    }
}

export async function deserialize() {
    if (!fileSystem.exists(NOTES_DIRECTORY)) {
        fileSystem.createDirectory(NOTES_DIRECTORY);
    }

    const noteDirectories = await fileSystem.readDirectory(NOTES_DIRECTORY);
    const notes = [];

    for (let i = 0; i < noteDirectories.length; i++) {
        const noteId = noteDirectories[i];

        // Regex test what we found to ensure it's actually a note. Not that this is a catch all...
        if (regex.isId(noteId)) {
            const metaData = await fileSystem.readJSON(path.join(NOTES_DIRECTORY, noteId, 'metadata.json'));

            const note: Note = {
                id: noteId,
                name: metaData.name,
                dateCreated: moment(metaData.dateCreated).toDate(),
                dateModified: moment(metaData.dateModified).toDate(),
                notebooks: metaData.notebooks ?? [],
                tags: metaData.tags ?? [],
                trashed: metaData.trashed,
                favorited: metaData.favorited
            };

            notes.push(note);
        }
    }

    return {
        values: notes
    };
}

export async function loadNoteContentFromFileSystem(noteId: string) {
    return await fileSystem.readText(path.join(NOTES_DIRECTORY, noteId, 'index.md'));
}

export async function saveNoteToFileSystem(rootState: State, noteOrId: Note | string) {
    let note: Note;

    if (typeof noteOrId === 'string') {
        note = rootState.notes.values.find((n) => n.id === noteOrId)!;
    } else {
        note = noteOrId;
    }

    const directoryPath = path.join(NOTES_DIRECTORY, note.id);

    // Create parent directory if needed
    if (!fileSystem.exists(directoryPath)) {
        await fileSystem.createDirectory(directoryPath);
    }

    // Create empty attachment directory if needed
    const attachmentPath = path.join(directoryPath, 'attachments');
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
        tags: note.tags,
        trashed: note.trashed,
        favorited: note.favorited
    };

    await fileSystem.writeJSON(path.join(directoryPath, 'metadata.json'), json);
}

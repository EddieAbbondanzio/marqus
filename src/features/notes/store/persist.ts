import { Note } from '@/features/notes/common/note';
import { NOTES_DIRECTORY } from '@/features/notes/store';
import { NoteState } from '@/features/notes/store/state';
import { isId } from '@/store';
import { State } from '@/store/state';
import { fileSystem } from '@/shared/utils/file-system';
import moment from 'moment';
import path from 'path';
import { MutationPayload } from 'vuex';

export async function serialize(
    s: NoteState,
    { rootState, mutationPayload }: { rootState: State; mutationPayload: MutationPayload }
) {
    switch (mutationPayload.type) {
        // id was passed
        case 'notes/CREATE':
        case 'notes/SAVE':
            await saveNoteToFileSystem(rootState, mutationPayload.payload);
            break;

        case 'notes/DELETE':
            await fileSystem.deleteDirectory(path.join(NOTES_DIRECTORY, mutationPayload.payload));
            break;

        case 'notes/EMPTY_TRASH':
            throw Error('Not implmeneted');
            break;

        // Catch-all so we don't have to keep explicitly adding new cases
        default:
            await saveChangedNotes(rootState);
            break;
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

        // Regex test what we found to ensure it's actually a note. This is not a catch all...
        if (isId(noteId)) {
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

export async function saveChangedNotes(rootState: State) {
    const notes = rootState.notes.values.filter((n) => n.hasUnsavedChanges);

    for (const note of notes) {
        await saveNoteToFileSystem(rootState, note);
        note.hasUnsavedChanges = false;
    }
}

export async function saveNoteToFileSystem(rootState: State, noteOrId: Note | string) {
    let note: Note;

    if (noteOrId == null) {
        throw Error('No note or id passed');
    }

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

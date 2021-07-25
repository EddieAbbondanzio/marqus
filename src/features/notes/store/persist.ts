import { Note } from '@/features/notes/common/note';
import { NOTES_DIRECTORY } from '@/features/notes/store';
import { NoteMutations } from '@/features/notes/store/mutations';
import { NoteState } from '@/features/notes/store/state';
import { fileSystem } from '@/shared/utils';
import { isId } from '@/store';
import { UndoPayload } from '@/store/plugins/undo';
import moment from 'moment';
import path from 'path';
import { Commit, MutationPayload } from 'vuex';

export async function serialize(
    s: NoteState,
    { rootState, mutationPayload, commit }: { rootState: any; mutationPayload: MutationPayload; commit: Commit }
) {
    switch (mutationPayload.type as `notes/${keyof NoteMutations}`) {
        // id was passed
        case 'notes/CREATE':
            await saveNoteToFileSystem(rootState, mutationPayload.payload.value);
            break;

        case 'notes/DELETE':
            await fileSystem.deleteDirectory(path.join(NOTES_DIRECTORY, mutationPayload.payload.value));
            break;

        case 'notes/EMPTY_TRASH':
            throw Error('Not implemented');

        case 'notes/MARK_ALL_NOTES_SAVED': // Prevents infinite loop
            break;

        // Catch-all so we don't have to keep explicitly adding new cases
        default:
            await saveChangedNotes(rootState, commit);
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

export async function saveChangedNotes(rootState: any, commit: Commit) {
    const notes = rootState.notes.values.filter((n: any) => n.hasUnsavedChanges);

    if (notes.length === 0) {
        return;
    }

    for (const note of notes) {
        await saveNoteToFileSystem(rootState, note);
    }

    commit('notes/MARK_ALL_NOTES_SAVED');
}

export async function saveNoteToFileSystem(rootState: any, noteOrId: Note | string) {
    let note: Note;

    if (noteOrId == null) {
        throw Error('No note or id passed');
    }

    if (typeof noteOrId === 'string') {
        note = rootState.notes.values.find((n: any) => n.id === noteOrId)!;
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

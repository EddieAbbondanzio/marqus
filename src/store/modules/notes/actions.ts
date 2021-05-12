import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import { ActionTree } from 'vuex';
import { Note, NoteState } from './state';

export const actions: ActionTree<NoteState, State> = {
    async create({ commit }, note: Note) {
        commit('CREATE', note);
        await upsertToFileSystem(note);
    },
    async update({ commit }, note: Note) {
        commit('UPDATE', note);
        await upsertToFileSystem(note);
    },
    async delete({ commit }, id: string) {
        commit('DELETE', id);
    }
};

async function upsertToFileSystem(note: Note) {
    const directoryPath = `notes/${note.id}`;

    if (!fileSystem.exists(directoryPath)) {
        await fileSystem.createDirectory(directoryPath);

        // Create empty index.md
        await fileSystem.writeText(path.join(directoryPath, 'index.md'), '');
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

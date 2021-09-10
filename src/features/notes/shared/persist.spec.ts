import {
    loadNoteContent,
    NOTE_DIRECTORY,
    NOTE_CONTENT_FILE_NAME,
    saveNoteContent
} from '@/features/notes/shared/persist';
import { fileSystem } from '@/shared/utils';
import path from 'path';

describe('loadNoteContent()', () => {
    it('properly defines path', () => {
        const mock = jest.fn();
        fileSystem.readText = mock;

        const noteId = '1';
        loadNoteContent(noteId);
        expect(mock).toHaveBeenCalledWith(path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME));
    });
});

describe('saveNoteContent()', () => {
    it('properly defines path', () => {
        const mock = jest.fn();
        fileSystem.writeText = mock;

        const noteId = '1';
        const noteContent = 'content';
        saveNoteContent(noteId, noteContent);
        expect(mock).toHaveBeenCalledWith(path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME), noteContent);
    });
});

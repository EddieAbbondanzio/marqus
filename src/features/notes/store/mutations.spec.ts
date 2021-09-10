import { Note } from '@/features/notes/shared/note';
import { NoteMutations } from '@/features/notes/store/mutations';
import { NoteState } from '@/features/notes/store/state';
import { inject } from 'vuex-smart-module';

describe('Note mutations', () => {
    let state: NoteState;
    let mutations: NoteMutations;

    beforeEach(() => {
        state = new NoteState();
        mutations = inject(NoteMutations, {
            state
        });
    });

    describe('SET_STATE', () => {
        it('sets state', () => {
            let newState: NoteState = {
                values: [{ id: '1' } as Note]
            };

            mutations.SET_STATE(newState);
            expect(state.values).toHaveLength(1);
        });
    });

    describe('EMPTY_TRASH', () => {
        it('removes all notes with trashed = true', () => {
            state.values.push({ id: '1' } as Note);
            state.values.push({ id: '2', trashed: false } as Note);
            state.values.push({ id: '3', trashed: true } as Note);

            mutations.EMPTY_TRASH({});
            expect(state.values).toHaveLength(2);
            expect(state.values[0]).toHaveProperty('id', '1');
            expect(state.values[1]).toHaveProperty('id', '2');
        });
    });

    describe('CREATE', () => {
        it('throws if id is blank', () => {
            expect(() => {
                mutations.CREATE({
                    value: {
                        id: ' ',
                        name: 'test',
                        notebooks: [],
                        tags: []
                    }
                });
            }).toThrow();
        });

        it('throws if name is blank', () => {
            expect(() => {
                mutations.CREATE({
                    value: {
                        id: '1',
                        name: '  ',
                        notebooks: [],
                        tags: []
                    }
                });
            }).toThrow();
        });

        it('adds note to state', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'test',
                    notebooks: ['a'],
                    tags: ['b']
                }
            });

            expect(state.values).toHaveLength(1);
            const note = state.values[0];

            expect(note.id).toBe('1');
            expect(note.name).toBe('test');
            expect(note.notebooks[0]).toBe('a');
            expect(note.tags[0]).toBe('b');
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('SET_NAME', () => {
        it('sets new name and sets hasUnsavedChanges', () => {
            state.values.push({
                id: '1',
                name: 'test',
                notebooks: ['a'],
                tags: ['b'],
                dateCreated: new Date()
            });

            const note = state.values[0];
            expect(note.hasUnsavedChanges).toBeFalsy();

            mutations.SET_NAME({ value: { newName: 'foo', note } });
            expect(note).toHaveProperty('name', 'foo');
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('DELETE', () => {
        it('throws if note is not in state', () => {
            expect(() => {
                mutations.DELETE({ value: { id: '1' } as Note });
            });
        });

        it('removes note', () => {
            state.values.push({
                id: '1',
                name: 'test',
                notebooks: ['a'],
                tags: ['b'],
                dateCreated: new Date()
            });

            state.values.push({
                id: '2',
                name: 'test2',
                notebooks: ['a'],
                tags: ['b'],
                dateCreated: new Date()
            });

            mutations.DELETE({ value: { id: '1' } as Note });
            expect(state.values).toHaveLength(1);
            expect(state.values[0]).toHaveProperty('id', '2');
        });
    });

    describe('ADD_NOTEBOOK', () => {
        it('adds notebook to a single note', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            mutations.ADD_NOTEBOOK({
                value: {
                    note,
                    notebookId: 'a'
                }
            });

            expect(note.notebooks).toHaveLength(1);
            expect(note.notebooks[0]).toBe('a');
        });

        it('adds notebook to multiple notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.ADD_NOTEBOOK({
                value: {
                    note: [note, note2],
                    notebookId: 'a'
                }
            });

            expect(note.notebooks).toHaveLength(1);
            expect(note2.notebooks).toHaveLength(1);
            expect(note.notebooks[0]).toBe('a');
            expect(note2.notebooks[0]).toBe('a');
        });
    });

    describe('ADD_TAG', () => {
        it('adds tag to a single note', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            mutations.ADD_TAG({
                value: {
                    note,
                    tagId: 'a'
                }
            });

            expect(note.tags).toHaveLength(1);
            expect(note.tags[0]).toBe('a');
        });

        it('adds tag to multiple notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.ADD_TAG({
                value: {
                    note: [note, note2],
                    tagId: 'a'
                }
            });

            expect(note.tags).toHaveLength(1);
            expect(note2.tags).toHaveLength(1);
            expect(note.tags[0]).toBe('a');
            expect(note2.tags[0]).toBe('a');
        });
    });

    describe('REMOVE_NOTEBOOK', () => {
        it('removes notebook from a single note', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            note.notebooks.push('a');

            mutations.REMOVE_NOTEBOOK({
                value: {
                    note,
                    notebookId: 'a'
                }
            });

            expect(note.notebooks).toHaveLength(0);
        });

        it('removes notebook from multiple notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.REMOVE_NOTEBOOK({
                value: {
                    note: [note, note2],
                    notebookId: 'a'
                }
            });

            expect(note.notebooks).toHaveLength(0);
            expect(note2.notebooks).toHaveLength(0);
        });

        it('removes notebook from all notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.REMOVE_NOTEBOOK({
                value: {
                    notebookId: 'a'
                }
            });

            expect(note.notebooks).toHaveLength(0);
            expect(note2.notebooks).toHaveLength(0);
        });
    });

    describe('REMOVE_TAG', () => {
        it('removes tag from a single note', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: [],
                tags: ['a', 'b'],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.REMOVE_TAG({
                value: {
                    note,
                    tagId: 'a'
                }
            });

            expect(note.tags).toHaveLength(0);
            expect(note2.tags[0]).toBe('a');
        });
        it('removes tag from multiple notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: [],
                tags: ['a', 'b'],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.REMOVE_TAG({
                value: {
                    note: [note, note2],
                    tagId: 'a'
                }
            });

            expect(note.tags).toHaveLength(0);
            expect(note2.tags).toHaveLength(1);
        });

        it('removes tag from all notes', () => {
            const note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date()
            };

            state.values.push(note);

            const note2 = {
                id: '2',
                name: 'test2',
                notebooks: [],
                tags: ['a', 'b'],
                dateCreated: new Date()
            };

            state.values.push(note2);

            mutations.REMOVE_TAG({
                value: {
                    tagId: 'a'
                }
            });

            expect(note.tags).toHaveLength(0);
            expect(note2.tags).toHaveLength(1);
        });
    });

    describe('MOVE_TO_TRASH', () => {
        it('marks note as trashed, and sets hasUnsavedChanges', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date()
            };

            state.values.push(note);

            mutations.MOVE_TO_TRASH({ value: note });

            expect(note.trashed).toBeTruthy();
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('RESTORE_FROM_TRASH', () => {
        it('marks note as untrashed, and sets hasUnsavedChanges', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                trashed: true
            };

            state.values.push(note);

            mutations.RESTORE_FROM_TRASH({ value: note });

            expect(note.trashed).toBeFalsy();
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('FAVORITE', () => {
        it('sets favorited true and sets hasUnsavedChanges', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date()
            };

            state.values.push(note);

            expect(note.favorited).toBeFalsy();
            mutations.FAVORITE({ value: note });
            expect(note.favorited).toBeTruthy();
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('UNFAVORITE', () => {
        it('sets favorited false and sets hasUnsavedChanges', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                favorited: true
            };

            state.values.push(note);

            expect(note.favorited).toBeTruthy();
            mutations.UNFAVORITE({ value: note });
            expect(note.favorited).toBeFalsy();
            expect(note.hasUnsavedChanges).toBeTruthy();
        });
    });

    describe('MARK_ALL_NOTES_SAVED', () => {
        it('marks all notes as saved', () => {
            const note: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                hasUnsavedChanges: true
            };

            state.values.push(note);

            const note2: Note = {
                id: '1',
                name: 'test',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                hasUnsavedChanges: true
            };

            state.values.push(note2);

            mutations.MARK_ALL_NOTES_SAVED();

            expect(note.hasUnsavedChanges).toBeFalsy();
            expect(note2.hasUnsavedChanges).toBeFalsy();
        });
    });
});

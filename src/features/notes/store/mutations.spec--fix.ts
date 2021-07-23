import { NoteState } from '@/features/notes/store/state';

describe('note mutations', () => {
    let state: NoteState = null!;

    beforeEach(() => {
        state = {
            values: []
        };
    });

    describe('CREATE()', () => {
        it('throws error if no name passed', () => {
            expect(() => {
                mutations.CREATE(state, {});
            }).toThrow();
        });

        it('generates id', () => {
            mutations.CREATE(state, { name: 'cat' });
            expect(state.values[0].id).not.toBeUndefined();
        });

        it('adds note to array', () => {
            mutations.CREATE(state, { name: 'cat' });
            expect(state.values[0].name).toBe('cat');
        });
    });

    describe('NAME()', () => {
        it('throws error if no note found', () => {
            expect(() => {
                mutations.UPDATE(state, { id: '1' });
            }).toThrow();
        });

        it('updates name', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.SET_NAME(state, { id: '1', name: 'dog' });

            expect(state.values[0].name).toBe('dog');
        });
    });

    describe('DELETE()', () => {
        it('throws error if not found', () => {
            expect(() => {
                mutations.DELETE(state, { id: '1' });
            }).toThrow();
        });

        it('removes note from array', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.DELETE(state, { id: '1' });

            expect(state.values).toHaveLength(0);
        });
    });

    describe('ADD_NOTEBOOK()', () => {
        it('throws when no notebookId passed', () => {
            expect(() => {
                mutations.ADD_NOTEBOOK(state, { noteId: '1' });
            }).toThrow();
        });

        it('adds notebook to one note', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_NOTEBOOK(state, { noteId: '1', notebookId: 'a' });
            expect(state.values[0].notebooks).toHaveLength(1);
            expect(state.values[0].notebooks[0]).toBe('a');
        });

        it('adds notebook to multiple notes', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_NOTEBOOK(state, { noteId: ['1', '2'], notebookId: 'a' });

            expect(state.values[0].notebooks[0]).toBe('a');
            expect(state.values[1].notebooks[0]).toBe('a');
        });

        it("won't add a duplicate", () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_NOTEBOOK(state, { noteId: '1', notebookId: 'a' });
            expect(state.values[0].notebooks).toHaveLength(1);
        });
    });

    describe('ADD_TAG()', () => {
        it('throws when no tagId passed', () => {
            expect(() => {
                mutations.ADD_TAG(state, { noteId: '1' });
            }).toThrow();
        });

        it('adds tag to one note', () => {
            state.values.push({
                id: '1',
                name: 'cat',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_TAG(state, { noteId: '1', tagId: 'a' });
            expect(state.values[0].tags).toHaveLength(1);
            expect(state.values[0].tags[0]).toBe('a');
        });

        it('adds tag to multiple notes', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: [],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_TAG(state, { noteId: ['1', '2'], tagId: 'a' });

            expect(state.values[0].tags[0]).toBe('a');
            expect(state.values[1].tags[0]).toBe('a');
        });

        it("won't add a duplicate", () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.ADD_TAG(state, { noteId: '1', tagId: 'a' });
            expect(state.values[0].tags).toHaveLength(1);
        });
    });

    describe('REMOVE_NOTEBOOK()', () => {
        it('throws if no notebookId passed', () => {
            expect(() => {
                mutations.REMOVE_NOTEBOOK(state, { noteId: '1' });
            }).toThrow();
        });

        it('removes notebook from one note', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_NOTEBOOK(state, { noteId: '1', notebookId: 'a' });
            expect(state.values[0].notebooks).toHaveLength(0);
        });

        it('removes notebook from multiple notes', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_NOTEBOOK(state, { noteId: ['1', '2'], notebookId: 'a' });
            expect(state.values[0].notebooks).toHaveLength(0);
            expect(state.values[1].notebooks).toHaveLength(0);
        });

        it('removes from all notes if no note id passed', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: ['a'],
                tags: [],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_NOTEBOOK(state, { notebookId: 'a' });
            expect(state.values[0].notebooks).toHaveLength(0);
            expect(state.values[1].notebooks).toHaveLength(0);
        });
    });

    describe('REMOVE_TAG()', () => {
        it('throws if no tagId passed', () => {
            expect(() => {
                mutations.REMOVE_TAG(state, { noteId: '1' });
            }).toThrow();
        });

        it('removes tag from one note', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_TAG(state, { noteId: '1', tagId: 'a' });
            expect(state.values[0].tags).toHaveLength(0);
        });

        it('removes tag from multiple notes', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_TAG(state, { noteId: ['1', '2'], tagId: 'a' });
            expect(state.values[0].tags).toHaveLength(0);
            expect(state.values[1].tags).toHaveLength(0);
        });

        it('removes tag from all notes if no note id(s) passed', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            state.values.push({
                id: '2',
                name: 'bar',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.REMOVE_TAG(state, { tagId: 'a' });
            expect(state.values[0].tags).toHaveLength(0);
            expect(state.values[1].tags).toHaveLength(0);
        });
    });

    describe('MOVE_TO_TRASH()', () => {
        it('throws error if no note found', () => {
            expect(() => {
                mutations.MOVE_TO_TRASH(state, '1');
            }).toThrow();
        });

        it('sets trashed to true', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.MOVE_TO_TRASH(state, { id: '1' });
            expect(state.values[0].trashed).toBeTruthy();
        });
    });

    describe('RESTORE_FROM_TRASH', () => {
        it('throws error if no note found', () => {
            expect(() => {
                mutations.RESTORE_FROM_TRASH(state, { id: '1' });
            }).toThrow();
        });

        it('sets trashed to undefined', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date(),
                trashed: true
            });

            mutations.RESTORE_FROM_TRASH(state, { id: '1' });
            expect(state.values[0].trashed).toBeUndefined();
        });
    });

    describe('EMPTY_TRASH()', () => {
        it('only removes notes with trashed set to true', () => {
            state.values.push({
                id: '1',
                name: 'foo',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date(),
                trashed: true
            });

            state.values.push({
                id: '1',
                name: 'bar',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.EMPTY_TRASH(state);

            expect(state.values).toHaveLength(1);
            expect(state.values[0].name).toBe('bar');
        });
    });

    describe('FAVORITE', () => {
        it('throws if id not found', () => {
            expect(() => {
                mutations.FAVORITE(state, { id: '1' });
            }).toThrow();
        });

        it('sets favorited to true', () => {
            state.values.push({
                id: '1',
                name: 'bar',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date()
            });

            mutations.FAVORITE(state, { id: '1' });
            expect(state.values[0].favorited).toBeTruthy();
        });
    });

    describe('UNFAVORITE', () => {
        it('throws if id not found.', () => {
            expect(() => {
                mutations.UNFAVORITE(state, { id: '1' });
            }).toThrow();
        });

        it('sets favorited to false', () => {
            state.values.push({
                id: '1',
                name: 'bar',
                notebooks: [],
                tags: ['a'],
                dateCreated: new Date(),
                dateModified: new Date(),
                favorited: true
            });

            mutations.UNFAVORITE(state, { id: '1' });
            expect(state.values[0].favorited).toBeFalsy();
        });
    });
});

import { getters } from '@/features/ui/store/modules/local-navigation/getters';

describe('getters', () => {
    describe('isNoteBeingCreated()', () => {
        it('returns false if mode is update', () => {
            expect((getters as any).isNoteBeingCreated({ notes: { input: { mode: 'update' } } })).toBeFalsy();
        });

        it('returns true if mode is create', () => {
            expect((getters as any).isNoteBeingCreated({ notes: { input: { mode: 'create' } } })).toBeTruthy();
        });
    });

    describe('isNoteBeingUpdated()', () => {
        it('returns false if mode is create', () => {
            expect((getters as any).isNoteBeingUpdated({ notes: { input: { mode: 'create' } } })('1')).toBeFalsy();
        });

        it("returns false if mode is update but id doesn't match", () => {
            expect(
                (getters as any).isNoteBeingUpdated({ notes: { input: { mode: 'update', id: '2' } } })('1')
            ).toBeFalsy();
        });

        it('returns true if mode is update, and id matches', () => {
            expect(
                (getters as any).isNoteBeingUpdated({ notes: { input: { mode: 'update', id: '1' } } })('1')
            ).toBeTruthy();
        });
    });

    describe('activeNotes()', () => {
        let rootState: any = {};

        beforeEach(() => {
            rootState = {
                app: {
                    globalNavigation: {
                        active: null as any
                    }
                },
                notes: {
                    values: [
                        { id: '1', name: 'cat', tags: ['5', '6'], favorited: true },
                        { id: '2', name: 'dog' },
                        { id: '3', name: 'horse', notebooks: ['7', '8'] },
                        { id: '11', name: 'parent-note', notebooks: ['7'], favorited: true },
                        { id: '22', name: 'child-note', notebooks: ['8'], favorited: true }
                    ] as any[]
                },
                notebooks: {
                    values: [
                        { id: '7', value: 'parent', children: [{ id: '8', value: 'child' }] },
                        { id: '9', value: 'other' }
                    ]
                }
            };

            // Fix parent for child note
            (rootState.notebooks.values[0].children![0] as any).parent = rootState.notebooks.values[0];
        });

        it('returns empty array if active is null', () => {
            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(0);
        });

        it('returns entire note array when mode is all', () => {
            rootState.app.globalNavigation.active = 'all';

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(5);
        });

        it('excludes trashed notes when returning all', () => {
            rootState.notes.values.push({
                id: '420',
                name: 'useless',
                trashed: true,
                tags: [],
                notebooks: []
            });
            rootState.app.globalNavigation.active = 'all';

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(5);
        });

        it('returns notes in notebook when notebook is active', () => {
            rootState.app.globalNavigation.active = { type: 'notebook', id: '7' };

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(3);
        });

        it('returns notes of children as well', () => {
            rootState.app.globalNavigation.active = { type: 'notebook', id: '7' };

            const res = (getters as any).activeNotes({}, {}, rootState);

            expect(res).toHaveLength(3);
            expect(res[1].name).toBe('parent-note');
            expect(res[2].name).toBe('child-note');
        });

        it('excludes trashed notes from notebooks', () => {
            rootState.notes.values.push({
                id: '420',
                name: 'useless',
                trashed: true,
                tags: [],
                notebooks: ['7']
            });

            rootState.app.globalNavigation.active = { type: 'notebook', id: '7' };
            const res = (getters as any).activeNotes({}, {}, rootState);
            expect(res).toHaveLength(3);
        });

        it('returns notes in tag when tag is active', () => {
            rootState.app.globalNavigation.active = { type: 'tag', id: '5' };

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(1);
        });

        it('excludes trashed notes in tags', () => {
            rootState.notes.values.push({
                id: '420',
                name: 'useless',
                trashed: true,
                tags: ['5'],
                notebooks: []
            });

            rootState.app.globalNavigation.active = { type: 'tag', id: '5' };
            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(1);
        });

        it('returns favorited', () => {
            rootState.app.globalNavigation.active = 'favorites';

            const res = (getters as any).activeNotes({}, {}, rootState);
            expect(res).toHaveLength(3);
            expect(res[0]).toHaveProperty('id', '1');
            expect(res[1]).toHaveProperty('id', '11');
            expect(res[2]).toHaveProperty('id', '22');
        });

        it('excludes trash from favorites', () => {
            rootState.notes.values.push({
                id: '420',
                name: 'useless',
                trashed: true,
                tags: ['5'],
                notebooks: []
            });

            rootState.app.globalNavigation.active = 'favorites';
            const res = (getters as any).activeNotes({}, {}, rootState);
            expect(res).toHaveLength(3);
        });
    });
});

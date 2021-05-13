import { getters } from '@/store/modules/app/modules/local-navigation/getters';

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
        const rootState = {
            app: {
                globalNavigation: {
                    active: null as any
                }
            },
            notes: {
                values: [
                    { id: '1', name: 'cat', tags: ['5', '6'] },
                    { id: '2', name: 'dog' },
                    { id: '3', name: 'horse', notebooks: ['7', '8'] }
                ]
            }
        };

        it('returns empty array if active is null', () => {
            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(0);
        });

        it('returns entire note array when mode is all', () => {
            rootState.app.globalNavigation.active = 'all';

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(3);
        });

        it('returns notes in notebook when notebook is active', () => {
            rootState.app.globalNavigation.active = { type: 'notebook', id: '7' };

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(1);
        });

        it('returns notes in tag when tag is active', () => {
            rootState.app.globalNavigation.active = { type: 'tag', id: '5' };

            expect((getters as any).activeNotes({}, {}, rootState)).toHaveLength(1);
        });
    });
});

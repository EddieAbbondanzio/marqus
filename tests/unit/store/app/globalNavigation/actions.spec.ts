import { actions } from '@/store/modules/app/modules/global-navigation/actions';
import { Tag } from '@/store/modules/tags/state';
import { id } from '@/utils/id';
import * as confirmDelete from '@/utils/confirm-delete';

jest.mock('electron', () => ({
    remote: {
        dialog: {
            showMessageBox: jest.fn().mockReturnValue({ response: 0 })
        }
    }
}));

describe('GlobalNavigation Actions', () => {
    const context = {
        state: {
            tags: {
                input: {
                    mode: 'create'
                },
                entries: []
            }
        },
        rootState: {
            tags: {
                values: [] as Tag[]
            }
        }
    };

    describe('tagInputStart', () => {
        it('triggers input start, and expands tags section', () => {
            expectAction(actions.tagInputStart, null, context, ['TAG_INPUT_START', 'TAGS_EXPANDED']);
        });
    });

    describe('tagInputConfirm', () => {
        it('on create triggers create tag, sorts, and saves', () => {
            expectAction(actions.tagInputConfirm, null, context, [
                'tags/CREATE',
                'TAG_INPUT_CLEAR',
                'tags/SORT',
                'DIRTY'
            ]);
        });

        it('on update triggers update tag, sorts, and saves', () => {
            context.state.tags.input.mode = 'update';

            expectAction(actions.tagInputConfirm, null, context, [
                'tags/UPDATE',
                'TAG_INPUT_CLEAR',
                'tags/SORT',
                'DIRTY'
            ]);
        });
    });

    describe('tagInputCancel', () => {
        it('cancels', () => {
            expectAction(actions.tagInputCancel, null, context, ['TAG_INPUT_CLEAR']);
        });
    });

    describe('tagDelete', () => {
        it('confirms with user first', async () => {
            const tag: Tag = {
                id: id(),
                value: 'cat'
            };

            context.rootState.tags.values.push(tag);
            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');

            await (actions as any).tagDelete({ commit: jest.fn(), rootState: context.rootState }, tag.id);
            expect(confirmDeleteMock).toHaveBeenCalled();
        });

        it('if user confirms, tag is deleted', () => {
            const tag: Tag = {
                id: id(),
                value: 'cat'
            };

            context.rootState.tags.values.push(tag);

            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');
            confirmDeleteMock.mockReturnValue(Promise.resolve(true));

            expectAction(actions.tagDelete, tag.id, context, ['tags/DELETE', 'DIRTY']);
        });

        it('if user says no, stop.', () => {
            const tag: Tag = {
                id: id(),
                value: 'cat'
            };

            context.rootState.tags.values.push(tag);

            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');
            confirmDeleteMock.mockReturnValue(Promise.resolve(false));

            expectAction(actions.tagDelete, tag.id, context, []);
        });
    });

    describe('notebookInputStart', () => {
        it('triggers input start, and expands notebook section', () => {});
    });

    describe('notebookInputConfirm', () => {
        it('on create triggers create notebook, sorts, and save', () => {});

        it('on update triggers update notebook, sorts, and save', () => {});
    });

    describe('notebookInputCancel', () => {
        it('cancels', () => {});
    });

    describe('notebookDelete', () => {
        it('throws error if no notebook found.', () => {});

        it('confirms with user first', () => {});

        it('if user confirms, notebook is deleted', () => {});

        it('if user says no, stop.', () => {});
    });
});

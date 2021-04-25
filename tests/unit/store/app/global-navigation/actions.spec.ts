import { actions } from '@/store/modules/app/modules/global-navigation/actions';
import { Tag } from '@/store/modules/tags/state';
import { id } from '@/utils/id';
import * as confirmDelete from '@/utils/confirm-delete';
import { Notebook, NotebookState } from '@/store/modules/notebooks/state';

jest.mock('electron', () => ({
    remote: {
        dialog: {
            showMessageBox: jest.fn().mockReturnValue({ response: 0 }) // button index -> 'Yes'
        }
    }
}));

describe('GlobalNavigation Actions', () => {
    const context = {
        state: {
            tags: {
                input: {
                    mode: 'create'
                }
            },
            notebooks: {
                input: {
                    mode: 'create'
                },
                dragging: undefined as Notebook | undefined
            }
        },
        rootState: {
            tags: {
                values: [] as Tag[]
            },
            notebooks: {
                values: [] as Notebook[]
            }
        }
    };

    beforeEach(() => {
        context.state.tags.input.mode = 'create';
        context.state.notebooks.input.mode = 'create';
        context.rootState.notebooks.values.length = 0;
        context.rootState.tags.values.length = 0;
    });

    describe('setActive', () => {
        it('sets active, and marks state as dirty', async () => {
            await expectAction(actions.setActive, { id: '1', type: 'tag' }, context, ['ACTIVE', 'DIRTY']);
        });
    });

    describe('tagInputStart', () => {
        it('throws error if id passed, but no tag with matching id found', () => {
            const commit = jest.fn();

            expect(() =>
                (actions as any).tagInputStart({ commit, rootState: context.rootState }, 'not-an-id')
            ).toThrow();
        });

        it('triggers input start, and expands tags section', () => {
            expectAction(actions.tagInputStart, null, context, ['TAG_INPUT_START', 'TAGS_EXPANDED']);
        });
    });

    describe('tagInputConfirm', () => {
        it('throws error on invalid mode', () => {
            const commit = jest.fn();
            context.state.tags.input.mode = null!;

            expect(() => {
                (actions as any).tagInputConfirm({ commit, rootState: context.rootState });
            }).toThrow();
        });

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
        it('throws error when no tag with matching id found.', async () => {
            const commit = jest.fn();

            await expect(
                (actions as any).tagDelete({ commit, rootState: context.rootState }, 'not-an-id')
            ).rejects.toThrow();
        });

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
        it('throws error if id passed, but no notebook found.', () => {
            const commit = jest.fn();

            expect(() =>
                (actions as any).notebookInputStart({ commit, rootState: context.rootState }, { id: 'not-an-id' })
            ).toThrow();
        });

        it('triggers input start, and expands notebook section', () => {
            expectAction(actions.notebookInputStart, {}, context, ['NOTEBOOK_INPUT_START', 'NOTEBOOKS_EXPANDED']);
        });

        it('expands parent if nested notebook', async () => {
            context.rootState.notebooks.values = [{ id: '1', value: 'cat', expanded: false }];

            await expectAction(actions.notebookInputStart, { parentId: '1' }, context, [
                'NOTEBOOK_INPUT_START',
                'NOTEBOOKS_EXPANDED',
                'NOTEBOOK_EXPANDED'
            ]);
        });
    });

    describe('notebookInputConfirm', () => {
        it('throws error if invalid input mode', () => {
            const commit = jest.fn();
            context.state.notebooks.input.mode = null!;

            expect(() => {
                (actions as any).notebookInputConfirm({ commit, rootState: context.rootState });
            }).toThrow();
        });

        it('on create triggers create notebook, sorts, and save', () => {
            expectAction(actions.notebookInputConfirm, null, context, [
                'notebooks/CREATE',
                'NOTEBOOK_INPUT_CLEAR',
                'notebooks/SORT',
                'DIRTY'
            ]);
        });

        it('on update triggers update notebook, sorts, and save', () => {
            context.state.notebooks.input.mode = 'update';

            expectAction(actions.notebookInputConfirm, null, context, [
                'notebooks/UPDATE',
                'NOTEBOOK_INPUT_CLEAR',
                'notebooks/SORT',
                'DIRTY'
            ]);
        });
    });

    describe('notebookInputCancel', () => {
        it('cancels', () => {
            expectAction(actions.notebookInputCancel, null, context, ['NOTEBOOK_INPUT_CLEAR']);
        });
    });

    describe('notebookDelete', () => {
        it('throws error when no notebook with matching id found.', async () => {
            const commit = jest.fn();

            await expect(
                (actions as any).notebookDelete({ commit, rootState: context.rootState }, 'not-an-id')
            ).rejects.toThrow();
        });

        it('confirms with user first', async () => {
            const notebook: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false
            };

            context.rootState.notebooks.values.push(notebook);
            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');

            await (actions as any).notebookDelete({ commit: jest.fn(), rootState: context.rootState }, notebook.id);
            expect(confirmDeleteMock).toHaveBeenCalled();
        });

        it('if user confirms, notebook is deleted', () => {
            const notebook: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false
            };

            context.rootState.notebooks.values.push(notebook);

            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');
            confirmDeleteMock.mockReturnValue(Promise.resolve(true));

            expectAction(actions.notebookDelete, notebook.id, context, ['notebooks/DELETE', 'DIRTY']);
        });

        it('if user says no, stop.', () => {
            const notebook: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false
            };

            context.rootState.notebooks.values.push(notebook);

            const confirmDeleteMock = jest.spyOn(confirmDelete, 'confirmDelete');
            confirmDeleteMock.mockReturnValue(Promise.resolve(false));

            expectAction(actions.notebookDelete, notebook.id, context, []);
        });
    });

    describe('notebookDragStart', () => {
        it('sets dragging, and sets cursor title', async () => {
            const notebook: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false
            };

            context.rootState.notebooks.values.push(notebook);

            await expectAction(actions.notebookDragStart, notebook, context, ['NOTEBOOK_DRAGGING', 'app/CURSOR_TITLE']);
        });
    });

    describe('notebookDragStop', () => {
        it('throws error when drag was never started', () => {
            const commit = jest.fn();

            expect(() => {
                (actions as any).notebookDragStop({ commit, rootState: context.rootState });
            }).toThrow();
        });

        it("won't do anything if we try to drag to a child of what were dragging", () => {
            const parent: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false,
                children: []
            };

            const child: Notebook = {
                id: id(),
                value: 'dog',
                expanded: false
            };

            parent.children!.push(child);
            child.parent = parent;

            context.state.notebooks.dragging = parent;
            expectAction(actions.notebookDragStop, child.id, context, ['app/CURSOR_TITLE_CLEAR']);
        });

        it('moves notebook', async () => {
            const n1: Notebook = {
                id: id(),
                value: 'cat',
                expanded: false
            };

            const n2: Notebook = {
                id: id(),
                value: 'dog',
                expanded: false
            };

            context.rootState.notebooks.values.push(n1, n2);
            context.state.notebooks.dragging = n1;

            await expectAction(actions.notebookDragStop, n2.id, context, [
                'notebooks/DELETE',
                'notebooks/CREATE',
                'NOTEBOOK_EXPANDED',
                'NOTEBOOK_DRAGGING_CLEAR',
                'notebooks/SORT',
                'DIRTY',
                'app/CURSOR_TITLE_CLEAR'
            ]);
        });
    });
});

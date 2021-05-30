import { mutations } from '@/modules/app/global-navigation/store/mutations';
import { GlobalNavigation } from '@/modules/app/global-navigation/store/state';
import { generateId } from '@/core/store/entity';
import { Notebook } from '@/modules/notebooks/common/notebook';

describe('GlobalNavigation mutations', () => {
    let state: GlobalNavigation;

    beforeEach(() => {
        state = {
            notebooks: {
                expanded: false,
                input: {}
            },
            tags: {
                expanded: false,
                input: {}
            },
            width: '100px'
        };
    });

    describe('ACTIVE', () => {
        it('sets active', () => {
            mutations.ACTIVE(state, { id: '1', type: 'notebook' });
            expect(state.active).toStrictEqual({ id: '1', type: 'notebook' });
        });
    });

    describe('WIDTH', () => {
        it('sets width', () => {
            mutations.WIDTH(state, '300px');
            expect(state.width).toBe('300px');
        });
    });

    describe('TAGS_EXPANDED', () => {
        it('assigns tags.expanded to the parameter.', () => {
            mutations.TAGS_EXPANDED(state, true);
            expect(state.tags.expanded).toBeTruthy();
        });

        it('defaults to true', () => {
            mutations.TAGS_EXPANDED(state);
            expect(state.tags.expanded).toBeTruthy();
        });
    });

    describe('TAG_INPUT_VALUE', () => {
        it('sets value', () => {
            mutations.TAG_INPUT_VALUE(state, 'cat');
            expect(state.tags.input.value).toBe('cat');
        });
    });

    describe('TAG_INPUT_START', () => {
        it('sets mode to create when no id passed', () => {
            mutations.TAG_INPUT_START(state);
            expect(state.tags.input.mode).toBe('create');
        });

        it('sets id when in create mode', () => {
            mutations.TAG_INPUT_START(state);
            expect(state.tags.input.id).toBeTruthy();
        });

        it('sets mode to update when id passed', () => {
            const t = {
                id: generateId(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_START(state, t);
            expect(state.tags.input.mode).toBe('update');
        });

        it('sets id when in update mode', () => {
            const t = {
                id: generateId(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_START(state, t);
            expect(state.tags.input.id).toBe(t.id);
        });
    });

    describe('TAG_INPUT_CLEAR', () => {
        it('clears input out', () => {
            state.tags.input = {
                id: generateId(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_CLEAR(state);
            expect(state.tags.input.id).toBeUndefined();
            expect(state.tags.input.value).toBeUndefined();
            expect(state.tags.input.mode).toBeUndefined();
        });
    });

    describe('NOTEBOOKS_EXPANDED', () => {
        it('assigns notebooks.expanded to the parameter.', () => {
            mutations.NOTEBOOKS_EXPANDED(state, true);
            expect(state.notebooks.expanded).toBeTruthy();
        });

        it('defaults to true', () => {
            mutations.NOTEBOOKS_EXPANDED(state);
            expect(state.notebooks.expanded).toBeTruthy();
        });
    });

    describe('NOTEBOOK_INPUT_START', () => {
        it('sets mode as update when passed notebook is not null', () => {
            const notebook: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            mutations.NOTEBOOK_INPUT_START(state, { notebook });
            expect(state.notebooks.input.mode).toBe('update');
            expect(state.notebooks.input.id).toBe(notebook.id);
            expect(state.notebooks.input.value).toBe(notebook.value);
        });

        it('sets mode as create when passed notebook is null', () => {
            mutations.NOTEBOOK_INPUT_START(state, {});
            expect(state.notebooks.input.mode).toBe('create');
        });

        it('sets parent when creating nested', () => {
            const notebook: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            mutations.NOTEBOOK_INPUT_START(state, { parent: notebook });
            expect(state.notebooks.input.parent).toBe(notebook);
        });
    });

    describe('NOTEBOOK_INPUT_CLEAR', () => {
        it('resets input', () => {
            mutations.NOTEBOOK_INPUT_CLEAR(state, 'cat');
            expect(state.notebooks.input.id).toBeUndefined();
            expect(state.notebooks.input.mode).toBeUndefined();
            expect(state.notebooks.input.value).toBeUndefined();
            expect(state.notebooks.input.expanded).toBeUndefined();
        });
    });

    describe('NOTEBOOK_INPUT_VALUE', () => {
        it('sets input value', () => {
            mutations.NOTEBOOK_INPUT_VALUE(state, 'cat');
            expect(state.notebooks.input.value).toBe('cat');
        });
    });

    describe('NOTEBOOK_DRAGGING', () => {
        it('sets dragging', () => {
            const n: Notebook = {
                id: '1',
                value: 'cat',
                expanded: false
            };

            mutations.NOTEBOOK_DRAGGING(state, n);
            expect(state.notebooks.dragging).toBe(n);
        });
    });
});

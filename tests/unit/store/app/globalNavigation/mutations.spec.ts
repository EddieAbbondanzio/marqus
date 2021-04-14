import { mutations } from '@/store/modules/app/modules/global-navigation/mutations';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { id } from '@/utils/id';

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
            mutations.ACTIVE(state, true);
            expect(state.active).toBeTruthy();
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
                id: id(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_START(state, t);
            expect(state.tags.input.mode).toBe('update');
        });

        it('sets id when in update mode', () => {
            const t = {
                id: id(),
                value: 'Cat'
            };

            mutations.TAG_INPUT_START(state, t);
            expect(state.tags.input.id).toBe(t.id);
        });
    });

    describe('TAG_INPUT_CLEAR', () => {
        it('clears input out', () => {
            state.tags.input = {
                id: id(),
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
});

import { MutationTree } from 'vuex';
import { GlobalNavigation, GlobalNavigationActive } from '@/features/ui/store/modules/global-navigation/state';

export const mutations: MutationTree<GlobalNavigation> = {
    SET_STATE(state, s: GlobalNavigation) {
        console.log('set state to: ', s);
        Object.assign(state, s);
    },
    SET_ACTIVE(s, newValue: GlobalNavigationActive) {
        console.log('new active: ', newValue);
        s.active = newValue;
    },
    SET_WIDTH(s, newValue: string) {
        s.width = newValue;
    },
    SET_TAGS_EXPANDED(s, { value }: { value: boolean }) {
        s.tags.expanded = value;
    },
    SET_TAGS_INPUT(s, newValue: string) {
        if (s.tags.input == null) {
            throw Error('No tag input to update.');
        }

        s.tags.input.value = newValue;
    },
    START_TAGS_INPUT(s, tag: { id: string; value: string }) {
        if (tag == null) {
            s.tags.input = {
                mode: 'create',
                value: ''
            };
        } else {
            s.tags.input = {
                mode: 'update',
                id: tag.id,
                value: tag.value
            };
        }
    },
    CLEAR_TAGS_INPUT(s) {
        delete s.tags.input;
    },
    SET_NOTEBOOKS_EXPANDED(s, { value: newValue }: { value: boolean }) {
        s.notebooks.expanded = newValue;
    },
    SET_NOTEBOOKS_INPUT(s, { value }: { value: string }) {
        if (s.notebooks.input == null) {
            throw Error('No notebook input to update.');
        }

        s.notebooks.input.value = value;
    },
    START_NOTEBOOKS_INPUT(s, { notebook, parentId }: { notebook?: { id: string; value: string }; parentId?: string }) {
        if (notebook != null) {
            s.notebooks.input = {
                mode: 'update',
                id: notebook.id,
                value: notebook.value,
                parentId
            };
        } else {
            s.notebooks.input = {
                mode: 'create',
                value: '',
                parentId
            };
        }
    },
    CLEAR_NOTEBOOKS_INPUT(s) {
        delete s.notebooks.input;
    },
    SET_NOTEBOOKS_DRAGGING(s, { value }: { value: string }) {
        s.notebooks.dragging = value;
    }
};

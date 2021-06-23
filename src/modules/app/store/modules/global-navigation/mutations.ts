import { MutationTree } from 'vuex';
import { GlobalNavigation, GlobalNavigationActive } from '@/modules/app/store/modules/global-navigation/state';

export const mutations: MutationTree<GlobalNavigation> = {
    ACTIVE_UPDATED(s, newValue: GlobalNavigationActive) {
        s.active = newValue;
    },
    WIDTH_UPDATED(s, newValue: string) {
        s.width = newValue;
    },
    TAGS_EXPANDED_UPDATED(s, newValue: boolean) {
        s.tags.expanded = newValue;
    },
    TAGS_INPUT_UPDATED(s, newValue: string) {
        if (s.tags.input == null) {
            throw Error('No tag input to update.');
        }

        s.tags.input.value = newValue;
    },
    TAGS_INPUT_STARTED(s, tag: { id: string; value: string }) {
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
    TAGS_INPUT_CLEARED(s) {
        delete s.tags.input;
    },
    NOTEBOOKS_EXPANDED(s, newValue: boolean) {
        s.notebooks.expanded = newValue;
    },
    NOTEBOOKS_INPUT_UPDATED(s, newValue: string) {
        if (s.notebooks.input == null) {
            throw Error('No notebook input to update.');
        }

        s.notebooks.input.value = newValue;
    },
    NOTEBOOKS_INPUT_STARTED(
        s,
        { notebook, parentId }: { notebook?: { id: string; value: string }; parentId?: string }
    ) {
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
    NOTEBOOKS_INPUT_CLEARED(s) {
        delete s.notebooks.input;
    },
    NOTEBOOKS_DRAGGING_UPDATED(s, newValue: string) {
        s.notebooks.dragging = newValue;
    }
};

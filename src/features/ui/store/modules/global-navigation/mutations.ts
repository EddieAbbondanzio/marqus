import { MutationTree } from 'vuex';
import { GlobalNavigationState, GlobalNavigationItem } from '@/features/ui/store/modules/global-navigation/state';
import { Mutations } from 'vuex-smart-module';
import { UndoPayload, VoidUndoPayload } from '@/store/plugins/undo';

export class GlobalNavigationMutations extends Mutations<GlobalNavigationState> {
    SET_STATE(s: GlobalNavigationState) {
        Object.assign(this.state, s);
    }

    SET_ACTIVE(p: UndoPayload<GlobalNavigationItem>) {
        this.state.active = p.value;
    }

    SET_HIGHLIGHT(p: UndoPayload<GlobalNavigationItem>) {
        this.state.highlight = p.value;
    }

    SET_WIDTH(p: UndoPayload<string>) {
        this.state.width = p.value;
    }

    SET_SCROLL_POSITION(p: UndoPayload<number>) {
        this.state.scrollPosition = p.value;
    }

    SET_TAGS_EXPANDED(p: UndoPayload<boolean>) {
        this.state.tags.expanded = p.value;
    }

    SET_TAGS_INPUT(p: UndoPayload<string>) {
        if (this.state.tags.input == null) {
            return;
        }

        this.state.tags.input!.value = p.value;
    }

    START_TAGS_INPUT(p: UndoPayload<{ id: string; value: string } | undefined>) {
        if (p.value?.id == null) {
            this.state.tags.input = {
                mode: 'create',
                value: ''
            };
        } else {
            this.state.tags.input = {
                mode: 'update',
                id: p.value.id,
                value: p.value.value
            };
        }
    }

    CLEAR_TAGS_INPUT(p: VoidUndoPayload) {
        delete this.state.tags.input;
    }

    SET_NOTEBOOKS_EXPANDED(p: UndoPayload<boolean>) {
        this.state.notebooks.expanded = p.value;
    }

    SET_NOTEBOOKS_INPUT(p: UndoPayload<string>) {
        if (this.state.notebooks.input == null) {
            return;
        }

        this.state.notebooks.input!.value = p.value;
    }

    START_NOTEBOOKS_INPUT(p: UndoPayload<{ notebook?: { id: string; value: string }; parentId?: string }>) {
        if (p.value.notebook != null) {
            this.state.notebooks.input = {
                mode: 'update',
                id: p.value.notebook.id,
                value: p.value.notebook.value,
                parentId: p.value.parentId
            };
        } else {
            this.state.notebooks.input = {
                mode: 'create',
                value: '',
                parentId: p.value.parentId
            };
        }
    }

    CLEAR_NOTEBOOKS_INPUT(p?: VoidUndoPayload) {
        delete this.state.notebooks.input;
    }

    SET_NOTEBOOKS_DRAGGING(p: UndoPayload<string>) {
        this.state.notebooks.dragging = p.value;
    }

    CLEAR_NOTEBOOKS_DRAGGING(p: VoidUndoPayload) {
        delete this.state.notebooks.dragging;
    }
}

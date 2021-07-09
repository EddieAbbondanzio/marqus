import { MutationTree } from 'vuex';
import { GlobalNavigationState, GlobalNavigationActive } from '@/features/ui/store/modules/global-navigation/state';
import { Mutations } from 'vuex-smart-module';
import { UndoPayload } from '@/store/plugins/undo';

export class GlobalNavigationMutations extends Mutations<GlobalNavigationState> {
    SET_STATE(s: GlobalNavigationState) {
        Object.assign(this.state, s);
    }

    SET_ACTIVE(newValue: GlobalNavigationActive) {
        this.state.active = newValue;
    }

    SET_WIDTH(newValue: string) {
        this.state.width = newValue;
    }

    SET_TAGS_EXPANDED(p: UndoPayload<{ value: boolean }>) {
        this.state.tags.expanded = p.value;
    }

    SET_TAGS_INPUT(newValue: string) {
        if (this.state.tags.input == null) {
            throw Error('No tag input to update.');
        }

        this.state.tags.input!.value = newValue;
    }

    START_TAGS_INPUT(tag?: { id: string; value: string }) {
        if (tag == null) {
            this.state.tags.input = {
                mode: 'create',
                value: ''
            };
        } else {
            this.state.tags.input = {
                mode: 'update',
                id: tag.id,
                value: tag.value
            };
        }
    }

    CLEAR_TAGS_INPUT() {
        delete this.state.tags.input;
    }

    SET_NOTEBOOKS_EXPANDED({ value: newValue }: { value: boolean }) {
        this.state.notebooks.expanded = newValue;
    }

    SET_NOTEBOOKS_INPUT(newValue: string) {
        if (this.state.notebooks.input == null) {
            throw Error('No notebook input to update.');
        }

        this.state.notebooks.input!.value = newValue;
    }

    START_NOTEBOOKS_INPUT({ notebook, parentId }: { notebook?: { id: string; value: string }; parentId?: string }) {
        if (notebook != null) {
            this.state.notebooks.input = {
                mode: 'update',
                id: notebook.id,
                value: notebook.value,
                parentId
            };
        } else {
            this.state.notebooks.input = {
                mode: 'create',
                value: '',
                parentId
            };
        }
    }

    CLEAR_NOTEBOOKS_INPUT() {
        delete this.state.notebooks.input;
    }

    SET_NOTEBOOKS_DRAGGING(newValue?: string) {
        this.state.notebooks.dragging = newValue;
    }
}

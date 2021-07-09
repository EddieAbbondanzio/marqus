import { Notebook } from '@/features/notebooks/common/notebook';
import { GetterTree } from 'vuex';
import { Getters } from 'vuex-smart-module';
import { GlobalNavigationState, GlobalNavigationActive } from './state';

export class GlobalNavigationGetters extends Getters<GlobalNavigationState> {
    get isActive() {
        return (active: GlobalNavigationActive) => {
            switch (this.state.active?.section) {
                case 'all':
                case 'favorites':
                case 'trash':
                    return active.section === this.state.active.section;
                case 'notebook':
                case 'tag':
                    return active.section === this.state.active.section && active.id === this.state.active.id;
                default:
                    return false;
            }
        };
    }

    get indentation() {
        return (depth: number) => {
            return `${depth * 24}px`;
        };
    }

    get isTagBeingCreated() {
        return () => this.state.tags.input?.mode === 'create';
    }

    get isTagBeingUpdated() {
        return (id: string) => this.state.tags.input?.mode === 'update' && this.state.tags.input.id === id;
    }

    get isNotebookBeingCreated() {
        return (parentId: string | null) => {
            // Check to see if we are even in create mode first
            if (this.state.notebooks.input?.mode !== 'create') {
                return false;
            }

            // Now check to see if we're testing for a root notebook create
            if (parentId == null) {
                return this.state.notebooks.input?.parentId == null;
            }

            // Lastly, test for a nested notebook create
            if (parentId != null) {
                return this.state.notebooks.input?.parentId === parentId;
            }

            // If we somehow got here, halt and catch fire.
            throw Error();
        };
    }

    get isNotebookBeingUpdated() {
        return (id: string) => {
            return this.state.notebooks.input?.mode === 'update' && this.state.notebooks.input.id === id;
        };
    }

    get isNotebookBeingDragged() {
        return this.state.notebooks.dragging != null;
    }

    get canNotebookBeCollapsed() {
        return (n: Notebook) => {
            return (n.children?.length ?? 0) > 0;
        };
    }
}

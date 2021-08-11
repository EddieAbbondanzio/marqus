import { Notebook } from '@/features/notebooks/common/notebook';
import { notebooks } from '@/features/notebooks/store';
import { tags } from '@/features/tags/store';
import { GetterTree, Store } from 'vuex';
import { Context, Getters } from 'vuex-smart-module';
import { GlobalNavigationState, GlobalNavigationItem } from './state';

export class GlobalNavigationGetters extends Getters<GlobalNavigationState> {
    notebooks!: Context<typeof notebooks>;
    tags!: Context<typeof tags>;

    $init(store: Store<any>) {
        this.notebooks = notebooks.context(store);
        this.tags = tags.context(store);
    }

    isActive(active: GlobalNavigationItem) {
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
    }

    isHighlighted(item: GlobalNavigationItem) {
        if (this.state.highlight == null) {
            return false;
        }

        return item.section === this.state.highlight.section && (item as any).id === (this.state.highlight as any).id;
    }

    previousItem(): GlobalNavigationItem {
        if (this.state.highlight == null) {
            return { section: 'all' };
        }

        const previous = this.state.highlight;
        let next;

        switch (previous.section) {
            case 'notebook':
                next = this.notebooks.getters.getPrevious(previous.id);

                if (next == null) {
                    return { section: 'all' };
                } else {
                    return { section: 'notebook', id: next.id };
                }

            case 'tag':
                next = this.tags.getters.getPrevious(previous.id);

                if (next == null) {
                    // See if we can get a notebook to jump up to
                    next = this.state.notebooks.expanded ? this.notebooks.getters.last() : null;

                    if (next == null) {
                        return { section: 'all' };
                    } else {
                        return { section: 'notebook', id: next.id };
                    }
                } else {
                    return { section: 'tag', id: next.id };
                }

            case 'favorites':
                next = this.state.tags.expanded ? this.tags.getters.last() : null;

                if (next == null) {
                    next = this.state.notebooks.expanded ? this.notebooks.getters.last() : null;

                    if (next == null) {
                        return { section: 'all' };
                    } else {
                        return { section: 'notebook', id: next.id };
                    }
                } else {
                    return { section: 'tag', id: next.id };
                }

            case 'trash':
                return { section: 'favorites' };
        }

        return { section: 'all' };
    }

    nextItem(): GlobalNavigationItem {
        // Start at the top
        if (this.state.highlight == null) {
            return { section: 'all' };
        }

        const previous = this.state.highlight;
        let next;

        switch (previous.section) {
            case 'all':
                next = this.state.notebooks.expanded ? this.notebooks.getters.first() : null;

                if (next == null) {
                    // If no notebook, see if we can hit a tag
                    next = this.state.tags.expanded ? this.tags.getters.first() : null;

                    if (next == null) {
                        return { section: 'favorites' };
                    } else {
                        return { section: 'tag', id: next.id };
                    }
                } else {
                    return { section: 'notebook', id: next.id };
                }

            case 'notebook':
                next = this.notebooks.getters.getNext(previous.id);

                if (next == null) {
                    next = this.state.tags.expanded ? this.tags.getters.first() : null;

                    if (next == null) {
                        return { section: 'favorites' };
                    } else {
                        return { section: 'tag', id: next.id };
                    }
                } else {
                    return { section: 'notebook', id: next.id };
                }

            case 'tag':
                next = this.tags.getters.getNext(previous.id);

                if (next == null) {
                    return { section: 'favorites' };
                } else {
                    return { section: 'tag', id: next.id };
                }

            case 'favorites':
                return { section: 'trash' };
        }

        return { section: 'all' };
    }

    indentation(depth: number) {
        return `${depth * 24}px`;
    }

    get isTagBeingCreated() {
        return this.state.tags.input?.mode === 'create';
    }

    isTagBeingUpdated(id: string) {
        return this.state.tags.input?.mode === 'update' && this.state.tags.input.id === id;
    }

    isNotebookBeingCreated(parentId: string | null) {
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
    }

    isNotebookBeingUpdated(id: string) {
        return this.state.notebooks.input?.mode === 'update' && this.state.notebooks.input.id === id;
    }

    get isNotebookBeingDragged() {
        return this.state.notebooks.dragging != null;
    }

    canNotebookBeCollapsed(n: Notebook) {
        return (n.children?.length ?? 0) > 0;
    }
}

import { generateId } from '@/core/store/entity';
import { MutationTree } from 'vuex';
import { LocalNavigation, LocalNavigationEvent } from './state';
import { mapEventSourcedMutations } from '@/core/store/map-event-sourced-mutations';

export const mutations: MutationTree<LocalNavigation> = {
    ...mapEventSourcedMutations<LocalNavigation, LocalNavigationEvent>({
        history: (s) => s.history,
        apply,
        undo
    })
};

export function apply(state: LocalNavigation, event: LocalNavigationEvent) {
    switch (event.type) {
        case 'activeChanged':
            state.active = event.newValue;
            break;

        case 'noteInputStarted':
            // Create
            if (event.note == null) {
                state.notes.input = {
                    id: generateId(),
                    name: '',
                    dateCreated: new Date(),
                    dateModified: new Date(),
                    mode: 'create'
                };

                // If an active record was passed, assign it as a tag, or notebook.
                if (event.active != null && typeof event.active !== 'string') {
                    switch (event.active.type) {
                        case 'notebook':
                            state.notes.input.notebooks = [event.active.id];
                            break;

                        case 'tag':
                            state.notes.input.tags = [event.active.id];
                            break;
                    }
                }
            }
            // Update
            else {
                state.notes.input = {
                    id: event.note.id,
                    name: event.note.name,
                    dateCreated: event.note.dateCreated,
                    dateModified: event.note.dateModified,
                    tags: event.note.tags,
                    notebooks: event.note.notebooks,
                    mode: 'update'
                };
            }

            break;

        case 'noteInputUpdated':
            state.notes.input.name = event.newValue;
            break;

        case 'noteInputCleared':
            state.notes.input = {};
            break;

        case 'widthUpdated':
            state.width = event.newValue;
            break;
    }
}

export function undo(state: LocalNavigation, event: LocalNavigationEvent) {
    switch (event.type) {
        case 'activeChanged':
            state.active = event.oldValue;
            break;

        case 'noteInputStarted':
            state.notes.input = {};
            break;

        case 'noteInputUpdated':
            state.notes.input.name = event.oldValue;
            break;

        case 'noteInputCleared':
            state.notes.input = event.oldValue;
            break;

        case 'widthUpdated':
            state.width = event.oldValue;
            break;
    }
}

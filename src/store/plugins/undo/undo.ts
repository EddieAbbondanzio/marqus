import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { fileSystem } from '@/utils/file-system';
import { TaskScheduler } from '@/utils/task-scheduler';
import { splitMutationAndNamespace } from '@/utils/vuex';
import { MutationPayload, Store } from 'vuex';

const state: UndoState = { modules: {}, schedulers: {} };

export const UNDO_HISTORY_DIRECTORY = 'history';

export const undo = {
    plugin<S>(store: Store<S>): UndoState {
        const release = store.subscribe((m, s) => {
            const [namespace] = splitMutationAndNamespace(m.type);

            if (state.modules[namespace] == null) {
                return;
            }

            // Add event to the modules history
            state.modules[namespace].push({
                payload: m
            });

            state.schedulers[namespace].schedule(
                // TODO: type error if unwrapped.
                async () => await fileSystem.writeJSON(`${namespace}.json`, state.modules[namespace])
            );
        });

        state.release = release;

        // State is only returned for unit testing purposes.
        return state;
    },
    async init(): Promise<void> {
        // Create the history parent directory if it doesn't exist.
        if (!fileSystem.exists(UNDO_HISTORY_DIRECTORY)) {
            fileSystem.createDirectory(UNDO_HISTORY_DIRECTORY);

            // If we created the directory that means it will be empty AKA nothing to read in.
            return;
        }

        const files = await fileSystem.readDirectory(UNDO_HISTORY_DIRECTORY);

        // Try to load in any json files we can find.
        for (const file of files) {
            if (file.endsWith('.json')) {
                const moduleName = file.slice(0, -5); // Trim off .json ending
                const events = await fileSystem.readJSON(file);

                // TODO: Add some validation lol.
                state.modules[moduleName].events = events;
            }
        }
    },
    registerModule(namespace: string) {
        state.modules[namespace] = new UndoHistory();
    },
    getModule(namespace: string): UndoModule {
        if (state.modules[namespace] == null) {
            throw Error(`No module ${namespace} registered with undo plugin`);
        }

        const m = state.modules[namespace];

        return {
            canRedo: m.canFastForward,
            canUndo: m.canRewind,
            redo: m.fastForward,
            undo: m.rewind
        };
    }
};

export interface UndoModule {
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): void;
    redo(): void;
}

export interface UndoState {
    release?: () => void;
    modules: UndoModules;
    schedulers: { [namespace: string]: TaskScheduler };
}

export interface UndoModules {
    [namespace: string]: UndoHistory;
}

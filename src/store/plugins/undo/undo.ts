import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoModule, UndoModuleSettings } from '@/store/plugins/undo/undo-module';
import { splitMutationAndNamespace } from '@/store/utils/split-mutation-and-namespace';
import { fileSystem } from '@/utils/file-system';
import { TaskScheduler } from '@/utils/task-scheduler';
import { MutationPayload, Store } from 'vuex';
import { UndoGroup, UndoHistoryEvent } from '@/store/plugins/undo/types';

const state: UndoState = { modules: {}, schedulers: {} };
let vuexStore: Store<any>;

export const UNDO_HISTORY_DIRECTORY = 'history';

/**
 * Undo / redo vuex plugin
 */
export const undo = {
    /**
     * Plugin function that should be called when creating the store. (plugins: [undo.plugin])
     * @param store The store the plugin is being added to.
     * @returns
     */
    plugin<S>(store: Store<S>): UndoState {
        vuexStore = store;

        const release = store.subscribe((m, s) => {
            const [namespace] = splitMutationAndNamespace(m.type);

            if (state.modules[namespace] == null) {
                return;
            }

            // Add event to the modules history
            state.modules[namespace].cache(m);

            state.schedulers[namespace].schedule(
                // TODO: fix type error if unwrapped.
                async () => await fileSystem.writeJSON(`${namespace}.json`, state.modules[namespace])
            );
        });

        state.release = release;

        // State is only returned for unit testing purposes.
        return state;
    },
    /**
     * Initialization. Should be called at the start of the app after registering
     * the plugin.
     */
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
                state.modules[moduleName].history.events = events;
            }
        }
    },
    /**
     * Register a module with the undo plugin.
     * @param settings The settings of the module.
     */
    registerModule(settings: UndoModuleSettings) {
        state.modules[settings.namespace] = new UndoModule(vuexStore, settings);
    },
    /**
     * Retrieve an undo module from the plugin. Throws if not found.
     * @param namespace The namespace of the module to retrieve.
     * @returns The desired module.
     */
    getModule(namespace: string): UndoModule {
        if (state.modules[namespace] == null) {
            throw Error(`No module ${namespace} registered with undo plugin`);
        }

        const m = state.modules[namespace];

        return m;
    },
    /**
     * Create a new undo group that bunches multiple commits into one undo.
     * @param moduleNamespace The namespace of the module to put it under.
     * @param handle The callback that will contain the commits of the group.
     */
    async group(moduleNamespace: string, handle: () => any) {
        const m = state.modules[moduleNamespace];

        if (m == null) {
            throw Error(`No module for namespace ${moduleNamespace} found.`);
        }

        const groupId = m.history.startGroup();

        // Handles can be async, or sync because not all actions will be async
        if (isAsync(handle)) {
            await handle();
        } else {
            handle();
        }

        m.history.stopGroup(groupId);
    }
};

export interface UndoState {
    release?: () => void;
    modules: { [namespace: string]: UndoModule };
    schedulers: { [namespace: string]: TaskScheduler };
}

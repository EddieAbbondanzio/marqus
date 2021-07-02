import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { UndoModule } from '@/store/plugins/undo/undo-module';
import { splitMutationAndNamespace } from '@/store/utils/split-mutation-and-namespace';
import { fileSystem } from '@/utils/file-system';
import { TaskScheduler } from '@/utils/task-scheduler';
import { MutationPayload, Store } from 'vuex';
import { UndoGroup, UndoHistoryEvent, UndoModuleSettings, UndoState } from '@/store/plugins/undo/types';
import { isAsync } from '@/store/plugins/undo/is-async';

const state: UndoState = { modules: {} };
const cache: { store: Store<any> } = {} as any;

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
        cache.store = store;

        const release = store.subscribe((m, s) => {
            const [namespace] = splitMutationAndNamespace(m.type);

            if (state.modules[namespace] == null) {
                return;
            }

            // Add event to the modules history
            state.modules[namespace].push(m);
        });

        state.release = release;

        // State is only returned for unit testing purposes.
        return state;
    },
    /**
     * Register a module with the undo plugin.
     * @param moduleState Initial state of the module.
     * @param settings The settings of the module.
     */
    registerModule(moduleState: any, settings: UndoModuleSettings) {
        // Check for duplicate name first
        if (
            Object.values(state.modules)
                .filter((m) => m.settings.name != null)
                .some((m) => m.settings.name === settings.name)
        ) {
            throw Error(`Duplicate undo module name ${settings.name}`);
        }

        state.modules[settings.namespace] = new UndoModule(moduleState, () => cache.store, settings);
    },
    /**
     * Retrieve an undo module from the plugin. Throws if not found.
     * @param name The name of the module to retrieve.
     * @returns The desired module.
     */
    getModule(name: string): UndoModule {
        const module = Object.values(state.modules)
            .filter((m) => m.settings.name != null)
            .find((m) => m.settings.name === name);

        if (module == null) {
            throw Error(`No module with name ${name} found.`);
        }

        return module;
    },
    /**
     * Create a new undo group that bunches multiple commits into one undo.
     * @param moduleNamespace The namespace of the module to put it under.
     * @param handle The callback that will contain the commits of the group.
     */
    async group(moduleNamespace: string, handle: (undoGroup: string) => any) {
        const m = state.modules[moduleNamespace];

        if (m == null) {
            throw Error(`No module for namespace ${moduleNamespace} found.`);
        }

        const groupId = m.startGroup();

        // Handles can be async, or sync because not all actions will be async
        if (isAsync(handle)) {
            await handle(groupId);
        } else {
            handle(groupId);
        }

        m.stopGroup(groupId);
    }
};

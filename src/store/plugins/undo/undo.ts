import { UndoGrouper, UndoModule } from '@/store/plugins/undo/undo-module';
import { splitMutationAndNamespace } from '@/store/common/utils/split-mutation-and-namespace';
import { UndoMetadata, UndoModuleSettings, UndoState } from '@/store/plugins/undo/types';
import { MutationPayload, Store } from 'vuex';

const state: UndoState = { modules: {}, store: null! };

/**
 * Undo / redo vuex plugin
 */
export const undo = {
    /**
     * Plugin function that should be called when creating the store. (plugins: [undo.plugin])
     * @param store The store the plugin is being added to.
     * @returns
     */
    plugin(store: Store<any>): UndoState {
        state.store = store;
        state.release = store.subscribe(undo.onMutation);

        // State is only returned for unit testing purposes.
        return state;
    },
    /**
     * Register a module with the undo plugin.
     * @param settings The settings of the module.
     */
    registerModule(initialState: any, settings: UndoModuleSettings) {
        // Check for duplicate name first
        if (
            Object.values(state.modules)
                .filter((m) => m.settings.name != null)
                .some((m) => m.settings.name === settings.name)
        ) {
            throw Error(`Duplicate undo module name ${settings.name}`);
        }

        settings.setStateMutation = 'SET_STATE';
        settings.stateCacheInterval = 100;

        // Add set state commit to ignore list, and fully qualify user provided ones.
        settings.ignore ??= [];
        settings.ignore.unshift(settings.setStateMutation);
        settings.ignore = settings.ignore.map(m => `${settings.namespace}/${m}`);

        /*
         * Store is null when modules are registered. Because of this, we need to pass in a method
         * that will return the store when called otherwise we'll just be giving the module a null value
         * that doesn't update when the store is set.
         */
        state.modules[settings.namespace] = new UndoModule(initialState, () => state.store, settings);
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
    onMutation(mutation: MutationPayload, s: Store<any>) {
        mutation.payload ??= {}
        mutation.payload.undo ??= {};

        const metadata = mutation.payload.undo as UndoMetadata;
        let [namespace, mutationName] = splitMutationAndNamespace(mutation.type);

        // Allow mutations from other namespaces to be included in a group.
        if (metadata.groupId != null && metadata.groupNamespace != null) {
            namespace = metadata.groupNamespace;
        }
        
        const module = state.modules[namespace];

        // If no module was found, we're not tracking it. Stop.
        if (module == null) {
            return;
        }
        // Check it's not on the mutation ignore list for the module
        if (mutation.payload.undo.ignore || state.modules[namespace].settings.ignore!.some(m => m === mutation.type)) {
            return;
        }
        // Throw if the payload was not an object. Required so we can add some metadata to it.
        if (typeof mutation.payload !== 'object') {
            throw Error(
                `Undo plugin requires that all mutation payloads be wrapped objects. 
                Mutation ${mutation.type} must have an object parameter, or be added to the ignore list.`
            );
        }
        // Add event to the modules history
        state.modules[namespace].push(mutation);
    },
    reset() {
        state.modules = {};
    },
    generateGrouper(namespace: string): UndoGrouper {
        const m = undo.getModule(namespace);
        const g = m.group.bind(m);

        return g;
    }
};

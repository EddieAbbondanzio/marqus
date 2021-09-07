import { generateId } from '@/store/common/types/entity';
import { splitMutationAndNamespace } from '@/store/common/utils/split-mutation-and-namespace';
import { UndoMetadata, UndoContextSettings, UndoState } from '@/store/plugins/undo/types';
import { UndoContext } from '@/store/plugins/undo/undo-context';
import { MutationPayload, Store } from 'vuex';

const state: UndoState = { contexts: {}, store: null! };

// Disable default undo / redo from webbrowser
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' || e.code === 'KeyY')) {
      e.preventDefault();
      return false;
    }
});

function onMutation(mutation: MutationPayload, s: Store<any>) {
    mutation.payload ??= {}

    let [namespace] = splitMutationAndNamespace(mutation.type);

    // Allow mutations from other namespaces to be included in a group.
    if (mutation.payload._undo?.group != null) {
        namespace = mutation.payload._undo.group.namespace;
    }
    
    const module = state.contexts[namespace];

    // If no module was found, we're not tracking it. Stop.
    if (module == null) {
        return;
    }

    const metadata = mutation.payload._undo ?? {} as UndoMetadata;

    // Check it's not on the mutation ignore list for the module
    if (metadata.ignore || state.contexts[namespace].settings.ignore!.some((m: any) => m === mutation.type)) {
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
    state.contexts[namespace].push(mutation);
}

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
        state.release = store.subscribe(onMutation);

        // State is only returned for unit testing purposes.
        return state;
    },
    /**
     * Register a module with the undo plugin.
     * @param settings The settings of the module.
     */
    registerContext(settings: UndoContextSettings) {
        // Check for duplicate name first
        if (
            Object.values(state.contexts)
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

        const id = settings.id ?? generateId();

        /*
         * Store is null when modules are registered. Because of this, we need to pass in a method
         * that will return the store when called otherwise we'll just be giving the module a null value
         * that doesn't update when the store is set.
         */
        state.contexts[settings.namespace] = new UndoContext(() => state.store, settings);
    },
    /**
     * Retrieve an undo module from the plugin. Throws if not found.
     * @returns The desired module.
     */
    getContext(opts: {id?: string, name?: string}): UndoContext {
        if (opts.id == null && opts.name == null) {
            throw Error('Name or id must be passed');
        }
        
        let module;
        
        if (opts.id != null) {
            module = Object.values(state.contexts)
            .find((m) => m.settings.id === opts.id);
        } else {
            module = Object.values(state.contexts)
            .filter((m) => m.settings.name != null)
            .find((m) => m.settings.name === opts.name);
        }
        
        if (module == null) {
            throw Error('No module with  found');
        }

        return module;
    },
    reset() {
        state.contexts = {};
    }
};

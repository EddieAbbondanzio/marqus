import { State } from '@/store/state';
import { DATA_DIRECTORY, fileSystem } from '@/shared/utils/file-system';
import { TaskScheduler } from '@/shared/utils/task-scheduler';
import { MutationPayload, Store } from 'vuex';
import * as _ from 'lodash';
import { PersistModule, PersistModuleSettings } from './types';
import { splitMutationAndNamespace } from '@/shared/utils/vuex';

let release: () => void;

/**
 * Vuex plugin to handle saving state to file.
 */
export const persist = {
    modules: [] as PersistModule[],
    plugin(store: Store<State>) {
        release = store.subscribe(
            function(this: typeof persist, p: MutationPayload, s: State) {
                const [namespace, mutation] = splitMutationAndNamespace(p.type);

                // See if we can find a subscriber first
                const subscriber = this.modules.find((m) => namespace.includes(m.settings.namespace));
                if (subscriber == null) {
                    return;
                }

                // Continue if no filter, or if the mutation is on the list
                if (subscriber.settings.filter == null || subscriber.settings.filter.some((mut) => mut === mutation)) {
                    const state = (s as any)[subscriber.settings.namespace]; // TODO: Add support for non root namespaces

                    // Set up a save to file task
                    subscriber.scheduler.schedule(async () => {
                        let s = _.cloneDeep(state);

                        // Apply the transformer to the state if one exists
                        if (subscriber.settings.transformer != null) {
                            s = subscriber.settings.transformer(s);

                            if (s == null) {
                                throw Error('No state returned from transformer. Did you forget to return the value?');
                            }
                        }

                        const fileName = getModuleFileName(subscriber);

                        // Save off the file
                        if (subscriber.settings.serialize != null) {
                            await subscriber.settings.serialize(s, {
                                rootState: store.state,
                                fileName,
                                mutationPayload: p
                            });
                        } else {
                            try {
                                await fileSystem.writeJSON(fileName, s);
                            } catch (e) {
                                console.error('Failed to serialize state', e);
                                console.log('State: ', s);
                            }
                        }
                    });
                }
            }.bind(persist)
        );
    },

    /**
     * Initialize store state by attempting to load any state json files
     * we can find.
     */
    async init(store: Store<State>) {
        // Don't load files in test
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        for (const m of this.modules) {
            let state: undefined | any;

            if (m.settings.deserialize != null) {
                state = await m.settings.deserialize();
            } else {
                /**
                 * We don't need to call the scheduler on read since it won't actually
                 * effect anything if we did read twice. Not that that would happen anyways.
                 */
                const fileName = getModuleFileName(m);
                state = await deserializeJSON(fileName);
            }

            // Revive state if needed
            if (state != null && m.settings.reviver) {
                state = m.settings.reviver(state);

                if (state == null) {
                    throw Error('No state returned from reviver. Did you forget to return the value?');
                }
            }

            if (state != null) {
                store.commit(`${m.settings.namespace}/${m.settings.initMutation}`, state);
            }
        }
    },

    /**
     * Register a module that the persist plugin should track.
     * @param pModule The module to register
     */
    register(pModule: PersistModuleSettings) {
        // Check for duplicate
        if (this.modules.some((m) => m.settings.namespace === pModule.namespace)) {
            throw Error(`Duplicate module registered ${pModule.namespace}`);
        }

        this.modules.push({ scheduler: new TaskScheduler(2), settings: pModule });
    },

    release() {
        if (release != null) {
            release();
        }
    }
};

async function deserializeJSON(fileName: string) {
    if (!fileSystem.exists(fileName)) {
        return null;
    }

    return await fileSystem.readJSON(fileName);
}

/**
 * Get the file name for saving the module state to JSON.
 * Checks .fileName first, then defaults to $NAMESPACE.json
 * @param m The module to determine the filename of.
 * @returns
 */
export function getModuleFileName(m: PersistModule) {
    // file name is defined
    if (m.settings.fileName != null) {
        return m.settings.fileName;
    }

    // Non-nested namespace
    if (!m.settings.namespace.includes('/')) {
        return `${m.settings.namespace}.json`;
    }

    // Nested
    const last = m.settings.namespace.split('/').slice(-1);
    return `${last}.json`;
}

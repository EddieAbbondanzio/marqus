import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import { TaskScheduler } from '@/utils/task-scheduler';
import { MutationPayload, Store } from 'vuex';
import * as _ from 'lodash';
import { PersistModule, PersistModuleSettings } from './persist-module';

/**
 * Vuex plugin to handle saving state to file.
 */
export const persist = {
    modules: [] as PersistModule[],

    plugin(store: Store<State>) {
        store.subscribe(
            function(this: typeof persist, p: MutationPayload, s: State) {
                const splitType = p.type.split('/');

                const namespace = splitType.slice(0, -1).join('/');
                const mutation = splitType.slice(-1)[0];

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
                        if (subscriber.settings.transformer) {
                            s = subscriber.settings.transformer(s);
                        }

                        // Save off the file
                        const fileName = getModuleFileName(subscriber);
                        await fileSystem.writeJSON(fileName, s);
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
        for (const m of this.modules) {
            const fileName = getModuleFileName(m);

            /**
             * We don't need to call the scheduler on read since it won't actually
             * effect anything if we did read twice. Not that that would happen anyways.
             */

            // Try to load state file
            if (fileSystem.exists(fileName)) {
                const json = await fileSystem.readJSON(fileName);
                let state = json;

                // Revive state if needed
                if (m.settings.reviver) {
                    state = m.settings.reviver(json);
                }

                store.commit(`${m.settings.namespace}/${m.settings.initiMutation}`, state);
            }
        }
    },

    /**
     * Register a module that the persist plugin should track.
     * @param module The module to register
     */
    register(module: PersistModuleSettings) {
        // Check for duplicate
        if (this.modules.some((m) => m.settings.namespace === module.namespace)) {
            throw Error(`Duplicate module registered ${module.namespace}`);
        }

        this.modules.push({ scheduler: new TaskScheduler(2), settings: module });
    }
};

export function getModuleFileName(module: PersistModule) {
    return module.settings.fileName ?? `${module.settings.namespace}.json`;
}

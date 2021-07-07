import { Store } from 'vuex';

/**
 * Base class for our type safe vuex modules.
 */
export abstract class VuexModule {
    [property: string]: any; // Needed by the proxy handler

    private static _instances: { [namespace: string]: VuexModule };

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }

    /**
     * Get another vuex module by namespace.
     * @param namespace The namespace to look up.
     * @returns The type safe instance of the vuex module.
     */
    getModule<TModule extends VuexModule>(namespace: string): TModule {
        if (VuexModule._instances == null || VuexModule._instances[namespace] == null) {
            throw Error(`No instance for namespace ${namespace} found.`);
        }

        return VuexModule._instances[namespace] as TModule;
    }

    /**
     * Cache an instance of the vuex module so we can do a lookup via namespace
     * using .getModule().
     * @param namespace The namespace of the module.
     * @param module The module instance.
     */
    static cacheModule(namespace: string, module: VuexModule) {
        /*
         * This functionality is not in the constructor on purpose. We don't want to cache
         * until the registerModule() helper has been called.
         */

        VuexModule._instances ??= {};

        if (VuexModule._instances[namespace] != null) {
            throw Error(`Module with namespace ${namespace} already registered. Did you call cacheModule() twice?`);
        }

        VuexModule._instances[namespace] = module;
    }

    static clearCache() {
        VuexModule._instances = {};
    }
}

// Don't use VuexModule['constructor']. TypeScript infers it as 'Function'
export type VuexModuleConstructor = new (store: Store<any>) => VuexModule;

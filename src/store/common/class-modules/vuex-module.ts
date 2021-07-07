import { Store } from 'vuex';

/**
 * Base class for our type safe vuex modules.
 */
export abstract class VuexModule {
    [property: string]: any; // Needed by the proxy handler

    private static _instances: { [namespace: string]: VuexModule } = {};

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }

    /**
     * Get another vuex module by namespace.
     * @param namespace The namespace to look up.
     * @returns The type safe instance of the vuex module.
     */
    getModule<TModule extends VuexModule>(namespace: string): TModule {
        if (this._instances[namespace] == null) {
            throw Error(`No instance for namespace ${namespace} found.`);
        }

        return this._instances[namespace] as TModule;
    }

    /**
     * Cache an instance of the vuex module so we can do a lookup via namespace
     * using .getModule().
     * @param namespace The namespace of the module.
     * @param module The module instance.
     */
    static cacheModule(namespace: string, module: VuexModule) {
        this._instances[namespace] = module;
    }
}

// Don't use VuexModule['constructor']. TypeScript infers it as 'Function'
export type VuexModuleConstructor = new (store: Store<any>) => VuexModule;

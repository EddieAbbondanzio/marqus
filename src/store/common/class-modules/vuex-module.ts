import { VuexModuleDefinition } from '@/store/common/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export type NestedVuexModules = { [namespace: string]: VuexModule };

/**
 * Base class for our type safe vuex modules.
 */
export abstract class VuexModule {
    [property: string]: any; // Needed by the proxy handler

    namespace!: string;
    modules!: NestedVuexModules;

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }
}

// Don't use VuexModule['constructor']. TypeScript infers it as 'Function'
export type VuexModuleConstructor = new (store: Store<any>) => VuexModule;

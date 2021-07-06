import { Store } from 'vuex';

export abstract class VuexModule {
    [property: string]: any;

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }
}

export type VuexModuleConstructor = new (store: Store<any>) => VuexModule; // Don't use VuexModule['constructor']. TypeScript infers it as 'Function'

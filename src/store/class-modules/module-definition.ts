import { Store } from 'vuex';

export type ModuleConstructor = new (store: Store<any>) => any;

export type MutationFunction = (arg: any) => void;

export type ActionFunction = (arg: any) => void | Promise<void>;

export abstract class VuexModule {
    constructor(store: Store<any>) {
        // the store parameter is just a dirty trick so we can get our module decorators to fire.
    }
}

export interface ModuleDefinition {
    constructor: ModuleConstructor;
    namespace: string;
    mutations: { [name: string]: MutationFunction };
    actions: { [name: string]: ActionFunction };
}

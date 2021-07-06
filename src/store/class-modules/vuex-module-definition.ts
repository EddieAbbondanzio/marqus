import { Store } from 'vuex';

export interface VuexModuleOptions {
    namespace: string;
}

export type VuexModuleConstructor = new (store: Store<any>) => VuexModule;

export type MutationFunction = (payload: any) => void;

export type ActionFunction = (state: any, payload: any) => void | Promise<void>;

export abstract class VuexModule {
    [property: string]: any;

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }
}

export type PropertyType = 'state' | 'getter' | 'mutation' | 'action' | 'other';

export class VuexModuleDefinition {
    public namespace?: string;

    constructor(public moduleConstructor: VuexModuleConstructor) {}

    mutations: { [name: string]: MutationFunction } = {};
    actions: { [name: string]: ActionFunction } = {};

    getPropertyType(name: string): PropertyType {
        // TODO: This will probably break on naming collisions.

        if (this.mutations[name] != null) {
            return 'mutation';
        } else if (this.actions[name] != null) {
            return 'action';
        }

        return 'other';
    }

    createInstance(store: Store<any>) {
        // eslint-disable-next-line new-cap
        const m = new this.moduleConstructor(store);
        return m;
    }
}

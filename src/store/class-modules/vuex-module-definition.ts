import { VuexModuleProxyHandler } from '@/store/class-modules/vuex-module-proxy-handler';
import { Store } from 'vuex';

export interface VuexModuleOptions {
    namespace: string;
}

export type VuexModuleConstructor = new (store: Store<any>) => VuexModule;

export type MutationFunction = (payload: any) => void;

export type ActionFunction = (payload: any) => void | Promise<void>;

export abstract class VuexModule {
    [property: string]: any;

    constructor(public store: Store<any>) {
        // the store parameter is just a trick so we can get our module decorators to fire.
    }
}

export type VuexModulePropertyType = 'state' | 'getter' | 'mutation' | 'action' | 'other';

export class VuexModuleProperty<T> {
    constructor(public type: VuexModulePropertyType, public name: string, public value: T) {}

    fullyQualify(namespace?: string) {
        return namespace == null ? this.name : `${namespace}/${this.name}`;
    }
}

export class VuexModuleDefinition {
    public namespace?: string;

    constructor(public moduleConstructor: VuexModuleConstructor) {}

    state: VuexModuleProperty<any> = new VuexModuleProperty('state', 'state', {});

    mutations: { [propertyName: string]: VuexModuleProperty<MutationFunction> } = {};

    actions: { [propertyName: string]: VuexModuleProperty<ActionFunction> } = {};

    getProperty<T>(name: string): VuexModuleProperty<T> {
        // TODO: This will probably break on naming collisions.

        if (this.mutations[name] != null) {
            return this.mutations[name] as any;
        } else if (this.actions[name] != null) {
            return this.actions[name] as any;
        } else if (name === 'state') {
            return this.state;
        }

        throw Error(`unsupported ${name}`);
    }

    generateProxy(store: Store<any>): VuexModule {
        // eslint-disable-next-line new-cap
        const m = new this.moduleConstructor(store);
        const proxy = new Proxy(m, new VuexModuleProxyHandler(this, store));
        return proxy;
    }
}

import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleProxyHandler } from '@/store/class-modules/vuex-module-proxy-handler';
import { Module, MutationMethod, Store } from 'vuex';

export type MutationFunction = (payload: any) => void;

export type ActionFunction = (payload: any) => void | Promise<void>;

export type VuexModulePropertyType = 'state' | 'getter' | 'mutation' | 'action';

export class VuexModuleProperty<T> {
    constructor(public type: VuexModulePropertyType, public name: string, public value: T) {}

    fullyQualify(namespace?: string) {
        return namespace == null ? this.name : `${namespace}/${this.name}`;
    }
}

export class VuexModuleDefinition {
    public namespace?: string;

    private _props: { [name: string]: VuexModuleProperty<any> } = {};

    constructor(public moduleConstructor: VuexModuleConstructor) {
        // Add default state in case user never used the decorator
        // eslint-disable-next-line dot-notation
        this._props['state'] = new VuexModuleProperty('state', 'state', {});
    }

    addProperty<T>(type: VuexModulePropertyType, name: string, value: T) {
        if (this._props[name] != null) {
            throw Error(`Property of name ${name} (type ${type} )already exists. It's best to avoid redundant names. `);
        }

        this._props[name] = new VuexModuleProperty(type, name, value);
    }

    getProperty<T>(name: string): VuexModuleProperty<T> {
        return this._props[name];
    }

    generate(store: Store<any>): [VuexModule, Module<any, any>] {
        const typeSafe = this._generateTypeSafeModule(store);
        const actualModule = this._generateVuexModule(typeSafe);

        return [typeSafe, actualModule];
    }

    private _generateTypeSafeModule(store: Store<any>): VuexModule {
        // eslint-disable-next-line new-cap
        const m = new this.moduleConstructor(store);
        const proxy = new Proxy(m, new VuexModuleProxyHandler(this, store));
        return proxy;
    }

    private _generateVuexModule(typeSafeModule: VuexModule): Module<any, any> {
        /*
         * We use .call() so we can set thisArg as the proxy because when the
         * mutation / action is commited / dispatched from vuex, 'this' will be the vuex store otherwise.
         */

        const mutations: any = {};
        for (const mutation of Object.values(this._props).filter((p) => p.type === 'mutation')) {
            mutations[mutation.name] = (_: any, payload: any) => mutation.value.call(typeSafeModule, payload);
        }

        const actions: any = {};
        for (const action of Object.values(this._props).filter((p) => p.type === 'action')) {
            actions[action.name] = (_: any, payload: any) => action.value.call(typeSafeModule, payload);
        }

        const getters: any = {};
        for (const getter of Object.values(this._props).filter((p) => p.type === 'getter')) {
            getters[getter.name] = (_: any, payload: any) => getter.value.call(typeSafeModule, payload);
        }

        const state = Object.values(this._props).find((p) => p.type === 'state')!;
        state.value = typeSafeModule[state.name];

        const module: Module<any, any> = {
            namespaced: true,
            mutations,
            actions,
            getters,
            state
        };

        return module;
    }
}

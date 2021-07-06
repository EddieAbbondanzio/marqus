import { store } from '@/store';
import { VuexModule, VuexModuleConstructor, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Module, Store } from 'vuex';

export function registerModule<TModule extends VuexModule>(constructor: VuexModuleConstructor): TModule {
    const def = moduleRegistry.getDefinition(constructor);
    const proxy = def.generateProxy(store) as TModule; // Cast is a little gross...

    if (def.namespace == null) {
        throw Error(
            `Vuex class modules only supports namespaced modules. No namespace found for ${def.moduleConstructor}`
        );
    }

    const module = _generateModule(def, proxy);
    store.registerModule(def.namespace, module);

    return proxy;
}

export function _generateModule(def: VuexModuleDefinition, proxy: VuexModule): Module<any, any> {
    const mutations: any = {};
    for (const [name, mut] of Object.entries(def.mutations)) {
        /*
         * We use .call() on the mutation handler so we can set thisArg as the proxy because when the
         * mutation is commited from vuex, 'this' will be the vuex store otherwise.
         */
        mutations[name] = (_: any, arg: any) => mut.value.call(proxy, arg);
    }

    const module: Module<any, any> = {
        namespaced: true,
        mutations,
        state: def.state.value
    };

    return module;
}

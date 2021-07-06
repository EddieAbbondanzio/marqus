import { store } from '@/store';
import { VuexModule, VuexModuleConstructor, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { generateVuexModuleProxy } from '@/store/class-modules/vuex-module-proxy';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Module, Store } from 'vuex';

export function registerModule<TModule extends VuexModule>(constructor: VuexModuleConstructor): TModule {
    const def = moduleRegistry.getDefinition(constructor);

    const proxy = generateVuexModuleProxy<TModule>(def, store);

    const mutations: any = {};
    for (const [key, value] of Object.entries(def.mutations)) {
        /*
         * We use .call() on the mutation handler so we can set thisArg as the proxy because when the
         * mutation is commited from vuex, 'this' will be the vuex store otherwise.
         */
        mutations[key] = (ignoreFirstArg: any, arg: any) => value.call(proxy, arg);
    }

    const module: Module<any, any> = {
        namespaced: true,
        mutations
    };

    store.registerModule(def.namespace!, module);
    // console.log('state prop: ', proxy.state.foo);

    return proxy;
}

import { store } from '@/store';
import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Module, Store } from 'vuex';

export function registerModule<TModule extends VuexModule>(constructor: VuexModuleConstructor): TModule {
    const definition = moduleRegistry.getDefinition(constructor);
    const typeSafeModule = definition.generateTypeSafeModule(store) as TModule; // Cast is a little gross...

    if (definition.namespace == null) {
        throw Error(
            `Vuex class modules only supports namespaced modules. No namespace found for ${definition.moduleConstructor}`
        );
    }

    // Instantiate the vuex module proxy and hand it off to Vuex.
    const actualModule = _generateModule(definition, typeSafeModule);
    store.registerModule(definition.namespace, actualModule);

    // Give back the type safe module
    return typeSafeModule;
}

export function _generateModule(definition: VuexModuleDefinition, typeSafeModule: VuexModule): Module<any, any> {
    /*
     * We use .call() so we can set thisArg as the proxy because when the
     * mutation / action is commited / dispatched from vuex, 'this' will be the vuex store otherwise.
     */

    const mutations: any = {};
    for (const [name, mutation] of Object.entries(definition.mutations)) {
        mutations[name] = (_: any, payload: any) => mutation.value.call(typeSafeModule, payload);
    }

    const actions: any = {};
    for (const [name, action] of Object.entries(definition.actions)) {
        actions[name] = (_: any, payload: any) => action.value.call(typeSafeModule, payload);
    }

    const module: Module<any, any> = {
        namespaced: true,
        mutations,
        actions,
        state: definition.state.value
    };

    return module;
}

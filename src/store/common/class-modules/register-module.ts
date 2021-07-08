import { VuexModule, VuexModuleConstructor } from '@/store/common/class-modules/vuex-module';
import { moduleRegistry } from '@/store/common/class-modules/vuex-module-definition-registry';
import { Module, Store } from 'vuex';

/**
 * Register a module with the vuex store.
 * @param constructor The constructor of the module.
 * @returns Type safe instance that can be used to commit mutations, dispatch actions, get state.
 */
export function registerModule<TModule extends VuexModule>(
    constructor: VuexModuleConstructor,
    store: Store<any>
): TModule {
    const definition = moduleRegistry.getDefinition(constructor);

    // Only supports namespaced modules right now
    if (definition.namespace == null) {
        throw Error(
            `Vuex class modules only supports namespaced modules. No namespace found for ${definition.moduleConstructor}`
        );
    }

    // Instantiate the vuex module proxy and hand it off to Vuex.
    const typeSafe = definition.register(store);

    // Give back the type safe module
    return typeSafe as TModule;
}

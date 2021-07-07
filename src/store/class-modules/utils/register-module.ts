import { store } from '@/store';
import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Module, Store } from 'vuex';

/**
 * Register a module with the vuex store.
 * @param constructor The constructor of the module.
 * @returns Type safe instance that can be used to commit mutations, dispatch actions, get state.
 */
export function registerModule<TModule extends VuexModule>(constructor: VuexModuleConstructor): TModule {
    const definition = moduleRegistry.getDefinition(constructor);

    // Duplicate namespaces are not allowed.
    if (definition.namespace == null) {
        throw Error(
            `Vuex class modules only supports namespaced modules. No namespace found for ${definition.moduleConstructor}`
        );
    }

    // Instantiate the vuex module proxy and hand it off to Vuex.
    const [typeSafe, actualModule] = definition.generate(store);
    store.registerModule(definition.namespace, actualModule);

    // Cache it so we can get it via .getModule()
    VuexModule.cacheModule(definition.namespace, typeSafe);

    // Give back the type safe module
    return typeSafe as TModule;
}

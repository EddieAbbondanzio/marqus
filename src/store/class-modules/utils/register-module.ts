import { store } from '@/store';
import { generateModule } from '@/store/class-modules/utils/generate-module';
import { VuexModule } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Store } from 'vuex';

export type TypedVuexModuleConstructor<TModule extends VuexModule> = new (store: Store<any>) => TModule;

export function registerModule<TModule extends VuexModule>(constructor: TypedVuexModuleConstructor<TModule>): TModule {
    const imp = new constructor(store);

    const def = moduleRegistry.getDefinition(constructor);
    const act = generateModule(def);

    console.log('register module!');
    store.registerModule(def.namespace, act);
    console.log(act);

    return imp;
}

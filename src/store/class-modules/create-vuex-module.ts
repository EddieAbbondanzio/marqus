import { store } from '@/store';
import { VuexModule } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export type TypedVuexModuleConstructor<TModule extends VuexModule> = new (store: Store<any>) => TModule;

export function createVuexModule<TModule extends VuexModule>(
    constructor: TypedVuexModuleConstructor<TModule>
): TModule {
    const m = new constructor(store);
    return m;
}

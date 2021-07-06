import { VuexModule, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export function generateVuexModuleProxy<TModule extends VuexModule>(
    definition: VuexModuleDefinition,
    store: Store<any>
): TModule {
    const typeSafeInstance = definition.createInstance(store);
    const proxy = new Proxy(typeSafeInstance, new VuexModuleProxyHandler(definition, store));

    return proxy as TModule; // Cast is a little gross.
}

export class VuexModuleProxyHandler {
    constructor(private _definition: VuexModuleDefinition, private _store: Store<any>) {}

    get(target: VuexModule, propertyName: string) {
        switch (this._definition.getPropertyType(propertyName)) {
            case 'mutation':
                return (arg: any) => this._store.commit(`${this._definition.namespace}/${propertyName}`, arg);
        }

        return target[propertyName];
    }
}

import { VuexModule, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export class VuexModuleProxyHandler {
    constructor(private _definition: VuexModuleDefinition, private _store: Store<any>) {}

    get(target: VuexModule, propertyName: string) {
        switch (this._definition.getPropertyType(propertyName)) {
            case 'mutation':
                return (arg: any) => this._store.commit(`${this._definition.namespace}/${propertyName}`, arg);

            case 'action':
                return (arg: any) => this._store.dispatch(`${this._definition.namespace}/${propertyName}`, arg);

            case 'state':
                // TODO: Add multi-level nested support
                return this._definition.state;

            case 'getter':
                // TODO: Add multi-level nested support
                return this._store.getters[this._definition.namespace!][propertyName];

            // Regular methods and properties on the class.
            case 'other':
                return target[propertyName];
        }
    }
}

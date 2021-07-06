import { VuexModule, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export class VuexModuleProxyHandler {
    constructor(private _definition: VuexModuleDefinition, private _store: Store<any>) {}

    get(target: VuexModule, propertyName: string) {
        const prop = this._definition.getProperty(propertyName);

        switch (prop.type) {
            case 'mutation':
                return (arg: any) => this._store.commit(prop.fullyQualify(this._definition.namespace), arg);

            case 'action':
                return (arg: any) => this._store.dispatch(prop.fullyQualify(this._definition.namespace), arg);

            case 'state':
                // TODO: Add multi-level nested support
                return prop.value;

            case 'getter':
                // TODO: Add multi-level nested support
                return prop.value;

            // Regular methods and properties on the class.
            case 'other':
                return target[propertyName];
        }
    }
}

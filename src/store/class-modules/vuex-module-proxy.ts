import { VuexModule, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

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

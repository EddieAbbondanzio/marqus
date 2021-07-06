import { VuexModule } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Store } from 'vuex';

export class VuexModuleProxyHandler {
    constructor(private _definition: VuexModuleDefinition, private _store: Store<any>) {}

    get(target: VuexModule, propertyName: string) {
        const prop = this._definition.getProperty(propertyName);

        switch (prop?.type) {
            case 'mutation':
                return (arg: any) => this._store.commit(prop.fullyQualify(this._definition.namespace), arg);

            case 'action':
                return (arg: any) => this._store.dispatch(prop.fullyQualify(this._definition.namespace), arg);

            case 'state':
                return prop.value;

            case 'getter':
                return prop.value;

            /*
             * Catch all to handle normal methods / properties on the class. These will likely be helper
             * methods used by the module, and we won't have any record of them in the definition.
             */
            default:
                return target[propertyName];
        }
    }
}

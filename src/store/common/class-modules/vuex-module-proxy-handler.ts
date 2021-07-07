import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/common/class-modules/vuex-module-definition';
import { Store } from 'vuex';

/**
 * Handler that will be passed to the proxy object so we can intercept properties.
 * This is what will connect our type safe module to the actual vuex store.
 */
export class VuexModuleProxyHandler {
    constructor(private _definition: VuexModuleDefinition, private _store: Store<any>) {}

    // Property sink
    get(target: VuexModule, propertyName: string) {
        const prop = this._definition.tryGetProperty(propertyName);

        switch (prop?.type) {
            case 'mutation':
                return (arg: any) => this._store.commit(prop.fullyQualify(), arg, { root: true });

            case 'action':
                return async (arg: any) => await this._store.dispatch(prop.fullyQualify(), arg);

            case 'state':
                return target[prop.name];

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

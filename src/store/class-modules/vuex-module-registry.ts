import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';

export class VuexModuleRegistry {
    private _definitions: Map<VuexModuleConstructor, VuexModuleDefinition>;
    private _instances: Map<string, VuexModule>;

    constructor() {
        this._definitions = new Map();
        this._instances = new Map();
    }

    getDefinition(constructor: VuexModuleConstructor): VuexModuleDefinition {
        let m = this._definitions.get(constructor);

        // If we didn't get a module back, go ahead and create it.
        if (m == null) {
            m = new VuexModuleDefinition(constructor);
            this._definitions.set(constructor, m);
        }

        return m;
    }

    cacheInstance<TModule extends VuexModule>(namespace: string, m: TModule) {
        this._instances.set(namespace, m);
    }

    getInstance<TModule extends VuexModule>(namespace: string): TModule {
        return this._instances.get(namespace) as TModule;
    }
}

export const moduleRegistry = new VuexModuleRegistry();

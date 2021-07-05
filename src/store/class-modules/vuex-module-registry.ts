import { VuexModuleConstructor, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';

export class VuexModuleRegistry {
    private _modules: Map<VuexModuleConstructor, VuexModuleDefinition>;

    constructor() {
        this._modules = new Map();
    }

    getDefinition(constructor: VuexModuleConstructor): VuexModuleDefinition {
        let m = this._modules.get(constructor);

        // If we didn't get a module back, go ahead and create it.
        if (m == null) {
            m = {
                namespace: '', // @Module() decorator will set this
                constructor,
                actions: {},
                mutations: {}
            };

            this._modules.set(constructor, m);
        }

        return m;
    }
}

export const moduleRegistry = new VuexModuleRegistry();

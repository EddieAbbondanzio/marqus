import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';

export class VuexModuleRegistry {
    private _definitions: Map<VuexModuleConstructor, VuexModuleDefinition>;

    constructor() {
        this._definitions = new Map();
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
}

export const moduleRegistry = new VuexModuleRegistry();

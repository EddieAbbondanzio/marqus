import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';

/**
 * Registry for storing all the vuex module definitions.
 */
export class VuexModuleRegistry {
    private _definitions: Map<VuexModuleConstructor, VuexModuleDefinition>;

    constructor() {
        this._definitions = new Map();
    }

    /**
     * Get (or create if none) the definition of vuex module by it's constructor.
     * @param constructor The constructor of the definition to retreive.
     * @returns The matching vuex module definition.
     */
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

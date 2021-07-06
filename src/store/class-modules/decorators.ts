import { registerModule } from '@/store/class-modules/utils/register-module';
import { VuexModule, VuexModuleConstructor } from '@/store/class-modules/vuex-module';
import { VuexModuleProperty } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Store } from 'vuex';

export type VuexModulePrototype = { [property: string]: any; constructor: any };

export interface VuexModuleOptions {
    namespace: string;
}

/**
 * Module class decorator. Used to set the options of a vuex module class.
 * @param options Various options for the module.
 */
export function Module(options: VuexModuleOptions) {
    /*
     * This decorator may feel a little useless, but it's so we can keep our module constructor
     * type definition simple.
     */
    return (target: VuexModuleConstructor) => {
        const m = moduleRegistry.getDefinition(target);
        m.namespace = options.namespace;
    };
}

export function Mutation(options?: { name?: string }) {
    return (target: VuexModulePrototype, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('mutation', name, target[propertyKey]);
    };
}

export function Action(options?: { name?: string }) {
    return (target: VuexModulePrototype, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('action', name, target[propertyKey]);
    };
}

export function Getter(options?: { name?: string }) {
    return (target: any, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('getter', name, target[propertyKey]);
    };
}

export function State() {
    return (target: VuexModulePrototype, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);

        /*
         * Because decorators are evaluated before instance properties are set, we only update the name for state.
         */
        const prop = definition.getProperty('state');
        prop.name = propertyKey;
    };
}

@Module({ namespace: 'test' })
export class TestClass extends VuexModule {
    @Getter()
    get fooBar() {
        console.log('gett this is: ', this);
        return 1;
        // return this.test.foo + this.test.bar;
    }

    @State()
    test: any = {
        foo: 1,
        bar: 2
    };

    constructor(store: Store<any>) {
        super(store);
    }

    @Mutation()
    TEST_MUTATION(newVal: number) {
        console.log('mut implementation this: ', this);
        this.state.foo = newVal;
        console.log('foo has been set to: ', newVal);
    }
}

export const testModule = registerModule<TestClass>(TestClass);
// testModule.TEST_MUTATION(4);
// console.log('foo is now: ', testModule.state.foo);

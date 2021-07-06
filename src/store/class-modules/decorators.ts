import { registerModule } from '@/store/class-modules/utils/register-module';
import { VuexModule, VuexModuleConstructor, VuexModuleOptions } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';
import { Store } from 'vuex';

export type DecoratorTarget = { [property: string]: any; constructor: any };

/**
 * Specify options such as namespace of a vuex module class.
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
    return (target: DecoratorTarget, propertyKey: string, descriptor: PropertyDescriptor) => {
        const definition = moduleRegistry.getDefinition(target.constructor);

        const name = options?.name ?? propertyKey;

        // Check we don't have a duplicate.
        if (definition.mutations[name] != null) {
            throw Error(`Mutation with name ${name} already exists for module ${definition.namespace}`);
        }

        definition.mutations[name] = target[propertyKey];
    };
}

// export function Action(options: { name?: string }) {
//     return (target: DecoratorTarget, propertyKey: string, descriptor: PropertyDescriptor) => {
//         const m = moduleRegistry.getDefinition(target.constructor);

//         const name = options?.name ?? propertyKey;

//         // Check we don't have a duplicate.
//         if (m.actions[name] != null) {
//             throw Error(`Action with name ${name} already exists for module ${m.namespace}`);
//         }

//         // Save off a reference to the method
//         m.actions[name] = target[propertyKey];
//     };
// }

// export function State() {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
// }

// export function Getter() {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
// }

@Module({ namespace: 'test' })
export class TestClass extends VuexModule {
    state: any = {
        foo: 1,
        bar: 2
    };

    constructor(store: Store<any>) {
        super(store);
    }

    @Mutation()
    TEST_MUTATION(newVal: number) {
        console.log('mut implementation called args:', arguments);
        console.log('mut implementation this: ', this);
        // console.log('TEST_MUTATION called. this is: ', this, ' newVal is: ', newVal);
        this.state.foo = newVal;
        console.log('foo has been set to: ', newVal);
    }
}

export const testModule = registerModule(TestClass);
// testModule.TEST_MUTATION(4);
// console.log('foo is now: ', testModule.state.foo);

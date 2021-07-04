import { store } from '@/store';
import { ModuleConstructor, VuexModule } from '@/store/class-modules/module-definition';
import { moduleRegistry } from '@/store/class-modules/module-registry';
import { Store } from 'vuex';

export function Module(namespace: string) {
    return (target: ModuleConstructor) => {
        moduleRegistry.add(namespace, target);
    };
}

// export function State() {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
// }

// export function Action() {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
// }

// export function Getter() {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
// }

export function Mutation() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        console.log('target: ', target);
        console.log('propertyKey: ', propertyKey);
        console.log('descriptor: ', descriptor);
    };
}

@Module('test')
export class TestClass extends VuexModule {
    testProperty = 'fish goes blub blub';

    constructor(store: Store<any>) {
        super(store);
    }

    @Mutation()
    method() {
        const i = 1;
        return i;
    }
}

export const testModule = new TestClass(store);

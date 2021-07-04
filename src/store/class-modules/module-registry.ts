import { ModuleConstructor, ModuleDefinition } from '@/store/class-modules/module-definition';

export const moduleRegistry = {
    modules: [] as ModuleDefinition[],

    add(namespace: string, constructor: ModuleConstructor) {
        this.modules.push({
            constructor,
            namespace,
            mutations: {},
            actions: {}
        });
    }
};

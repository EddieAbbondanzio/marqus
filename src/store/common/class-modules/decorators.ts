import { VuexModuleConstructor, moduleRegistry } from '@/store';

/**
 * Type signature for the prototype of vuex modules.
 */
export type VuexModulePrototype = { [property: string]: any; constructor: any };

/**
 * Options for defining vuex modules.
 */
export interface VuexModuleOptions {
    /**
     * The namespace the module should be registered under.
     */
    namespace: string;
}

/**
 * Module class decorator. Used to set the options of a vuex module class.
 * @param options Various options for the module.
 */
export function Module(options: VuexModuleOptions) {
    /*
     * This decorator may feel a little useless, but it's used so we can keep our module
     * constructor with as few parameters as possible.
     */
    return (target: VuexModuleConstructor) => {
        const m = moduleRegistry.getDefinition(target);
        m.namespace = options.namespace;
    };
}

/**
 * Property decorator for mutations.
 * @param options Various options.
 */
export function Mutation(options?: { name?: string }) {
    return (target: VuexModulePrototype, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('mutation', name, target[propertyKey]);
    };
}

/**
 * Property decorator for actions.
 * @param options Various options.
 */
export function Action(options?: { name?: string }) {
    return (target: VuexModulePrototype, propertyKey: string) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('action', name, target[propertyKey]);
    };
}

/**
 * Propetry decorator for getters
 * @param options Various options
 */
export function Getter(options?: { name?: string }) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const definition = moduleRegistry.getDefinition(target.constructor);
        const name = options?.name ?? propertyKey;

        definition.addProperty('getter', name, descriptor.get!);
    };
}

/**
 * Property decorator for state. If omitted, will be defaulted to .state
 */
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

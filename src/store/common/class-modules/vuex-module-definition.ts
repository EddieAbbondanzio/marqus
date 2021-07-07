import { VuexModule, VuexModuleConstructor } from '@/store/common/class-modules/vuex-module';
import { VuexModuleProxyHandler } from '@/store/common/class-modules/vuex-module-proxy-handler';
import { Module, MutationMethod, Store } from 'vuex';

export type MutationFunction = (payload: any) => void;

export type ActionFunction = (payload: any) => void | Promise<void>;

export type VuexModulePropertyDefinitionType = 'state' | 'getter' | 'mutation' | 'action';

/**
 * Property to represent an action, mutation, state, or getter on the module definition.
 */
export class VuexModuleDefinitionProperty<T> {
    constructor(public type: VuexModulePropertyDefinitionType, public name: string, public value: T) {}

    /**
     * Add the namespace of the module to the property if it has one.
     * @param namespace Optional namespace to prepend the property name with.
     * @returns The fully qualified path of the property.
     */
    fullyQualify(namespace?: string) {
        return namespace == null ? this.name : `${namespace}/${this.name}`;
    }
}

/**
 * Definition of a vuex module. Used as a template to generate the actual module instance.
 */
export class VuexModuleDefinition {
    public namespace?: string;

    private _props: { [name: string]: VuexModuleDefinitionProperty<any> } = {};

    constructor(public moduleConstructor: VuexModuleConstructor) {
        // Add default state in case user never used the decorator
        // eslint-disable-next-line dot-notation
        this._props['state'] = new VuexModuleDefinitionProperty('state', 'state', {});
    }

    /**
     * Add another property to the definition. Will throw on duplicate name.
     * @param type The property type.
     * @param name The name of the property.
     * @param value Underlying value. Usually a function.
     */
    addProperty<T>(type: VuexModulePropertyDefinitionType, name: string, value: T) {
        if (this._props[name] != null) {
            throw Error(`Property of name ${name} (type ${type} )already exists. It's best to avoid redundant names. `);
        }

        this._props[name] = new VuexModuleDefinitionProperty(type, name, value);
    }

    /**
     * Get a property by it's name.
     * @param name The name of the property to get.
     * @returns The matching property.
     */
    getProperty<T>(name: string): VuexModuleDefinitionProperty<T> {
        return this._props[name];
    }

    /**
     * Generate the type safe module instance, and the actual vuex module that will
     * be passed to the vuex store.
     * @param store The active vuex store.
     * @returns Tuple containing the type safe module, and the actual module.
     */
    generate(store: Store<any>): [VuexModule, Module<any, any>] {
        const typeSafe = this._generateTypeSafeModule(store);
        const actualModule = this._generateVuexModule(typeSafe);

        return [typeSafe, actualModule];
    }

    /**
     * Generate the type safe module.
     * @param store The active vuex store.
     * @returns The type safe module.
     */
    private _generateTypeSafeModule(store: Store<any>): VuexModule {
        // eslint-disable-next-line new-cap
        const m = new this.moduleConstructor(store);
        const proxy = new Proxy(m, new VuexModuleProxyHandler(this, store));
        return proxy;
    }

    /**
     * Generate the actual vuex module from the type safe one.
     * @param typeSafeModule The type safe module.
     * @returns The actual vuex module.
     */
    private _generateVuexModule(typeSafeModule: VuexModule): Module<any, any> {
        const m: Module<any, any> = {
            mutations: {},
            actions: {},
            getters: {},
            state: null!
        };

        for (const prop of Object.values(this._props)) {
            /*
             * We use .call(), and .bind() so we can set the thisArg. If we don't, then the actual vuex store is passed..
             */
            switch (prop.type) {
                case 'mutation':
                    m.mutations![prop.name] = (_: any, payload: any) => prop.value.call(typeSafeModule, payload);
                    break;

                case 'action':
                    m.actions![prop.name] = (_: any, payload: any) => prop.value.call(typeSafeModule, payload);
                    break;

                case 'getter':
                    m.getters![prop.name] = prop.value.bind(typeSafeModule);
                    break;

                case 'state':
                    if (m.state != null) {
                        throw Error(`State property already defined for module. Only 1 state property module allowed.`);
                    }

                    m.state.value = typeSafeModule[prop.name];
                    break;
            }
        }

        return m;
    }
}

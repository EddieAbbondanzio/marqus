import { Module } from '@/store/common/class-modules/decorators';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import {
    VuexModuleDefinition,
    VuexModuleDefinitionProperty
} from '@/store/common/class-modules/vuex-module-definition';
import { Store } from 'vuex';

describe('VuexModuleDefinitionProperty<T>', () => {
    describe('fullyQualify()', () => {
        it('returns proper name without namespace', () => {
            const testProp = new VuexModuleDefinitionProperty('mutation', 'TEST_MUTATION', () => 1);
            expect(testProp.fullyQualify()).toBe('TEST_MUTATION');
        });

        it('returns proper name when namespaced', () => {
            const testProp = new VuexModuleDefinitionProperty('mutation', 'TEST_MUTATION', () => 1, {
                namespace: 'testNamespace'
            } as any);
            expect(testProp.fullyQualify()).toBe('testNamespace/TEST_MUTATION');
        });
    });
});

describe('VuexModuleDefinition', () => {
    describe('ctor()', () => {
        it('sets default state property', () => {
            const def = new VuexModuleDefinition(null!);

            const stateProp = def['_props'][VuexModuleDefinition.DEFAULT_STATE_NAME];
            expect(stateProp).not.toBeUndefined();
        });
    });

    describe('addProperty<T>()', () => {
        it('saves off property', () => {
            const def = new VuexModuleDefinition(null!);

            const propValue = () => 1;
            const prop = def.addProperty('mutation', 'DO_SOMETHING', propValue);

            expect(def['_props']['DO_SOMETHING']).not.toBeUndefined();
            expect(def['_props']['DO_SOMETHING'].value).toBe(propValue);
        });

        it('throws on duplicate name', () => {
            const def = new VuexModuleDefinition(null!);
            const prop = def.addProperty('mutation', 'DO_SOMETHING', () => 1);

            expect(() => def.addProperty('mutation', 'DO_SOMETHING', () => 1)).toThrow();
        });
    });

    describe('getProperty<T>()', () => {
        it('throws on no property found', () => {
            const def = new VuexModuleDefinition(null!);
            expect(() => def.getProperty('foo')).toThrow();
        });

        it('returns the property', () => {
            const def = new VuexModuleDefinition(null!);
            const prop = def.addProperty('mutation', 'DO_SOMETHING', () => 1);

            const returnedProp = def.getProperty('DO_SOMETHING');
            expect(returnedProp).toBe(prop);
        });
    });

    describe('tryGetProperty<T>()', () => {
        it('returns the property', () => {
            const def = new VuexModuleDefinition(null!);
            const prop = def.addProperty('mutation', 'DO_SOMETHING', () => 1);

            const returnedProp = def.tryGetProperty('DO_SOMETHING');
            expect(returnedProp).toBe(prop);
        });

        it('returns undefined if not found', () => {
            const def = new VuexModuleDefinition(null!);
            const returnedProp = def.tryGetProperty('DO_SOMETHING');
            expect(returnedProp).toBeUndefined();
        });
    });

    describe('_generateTypeSafeModule()', () => {
        it('uses constructor passed', () => {
            const def = new VuexModuleDefinition(TestModule);
            const instance = def['_generateTypeSafeModule']({} as any);
            expect(instance).toBeInstanceOf(TestModule);
        });
    });

    describe('_generateVuexModule()', () => {
        it('assigns mutations', () => {
            const def = new VuexModuleDefinition(TestModule);
            def.addProperty('mutation', 'MUTATION_1', () => 1);
            def.addProperty('mutation', 'MUTATION_2', () => 2);
            def.addProperty('mutation', 'MUTATION_3', () => 3);

            const typeSafe = def['_generateTypeSafeModule']({} as any);
            const actual = def['_generateVuexModule'](typeSafe);
            expect(actual.mutations).toHaveProperty('MUTATION_1');
            expect(actual.mutations).toHaveProperty('MUTATION_2');
            expect(actual.mutations).toHaveProperty('MUTATION_3');
        });

        it('assigns actions', () => {
            const def = new VuexModuleDefinition(TestModule);
            def.addProperty('action', 'action1', () => 1);
            def.addProperty('action', 'action2', () => 1);
            def.addProperty('action', 'action3', () => 1);

            const typeSafe = def['_generateTypeSafeModule']({} as any);
            const actual = def['_generateVuexModule'](typeSafe);
            expect(actual.actions).toHaveProperty('action1');
            expect(actual.actions).toHaveProperty('action2');
            expect(actual.actions).toHaveProperty('action3');
        });

        it('assigns getters', () => {
            const def = new VuexModuleDefinition(TestModule);
            def.addProperty('getter', 'fooGetter', () => 1);

            const typeSafe = def['_generateTypeSafeModule']({} as any);
            const actual = def['_generateVuexModule'](typeSafe);
            expect(actual.getters).toHaveProperty('fooGetter');
        });

        it('assigns state', () => {
            const def = new VuexModuleDefinition(TestModule);

            const typeSafe = def['_generateTypeSafeModule']({} as any);
            const actual = def['_generateVuexModule'](typeSafe);
            expect(actual).toHaveProperty('state'); // testing for default
            expect(actual.state).not.toBeNull();
        });
    });

    describe('generate()', () => {
        it('it calls appropriate helpers', () => {
            const def = new VuexModuleDefinition(TestModule);
            def['_generateTypeSafeModule'] = jest.fn();
            def['_generateVuexModule'] = jest.fn();

            def.register({} as any);
            expect(def['_generateTypeSafeModule']).toHaveBeenCalled();
            expect(def['_generateVuexModule']).toHaveBeenCalled();
        });
    });

    @Module({ namespace: 'test' })
    class TestModule extends VuexModule {
        constructor(store: Store<any>) {
            super(store);
        }
    }
});

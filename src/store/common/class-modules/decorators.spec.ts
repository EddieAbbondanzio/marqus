import { Action, Getter, Module, Mutation, State } from '@/store/common/class-modules/decorators';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { moduleRegistry } from '@/store/common/class-modules/vuex-module-definition-registry';
import { Store } from 'vuex';

describe('Decorators', () => {
    beforeEach(() => {
        moduleRegistry.clear();
    });

    describe('@Module', () => {
        it('sets the namespace of a module', () => {
            const ret = Module({ namespace: 'test' });
            ret(TestModule);

            const def = moduleRegistry.getDefinition(TestModule);
            expect(def.namespace).toBe('test');
        });
    });

    describe('@Mutation', () => {
        it('adds mutation property', () => {
            const ret = Mutation();
            ret({ constructor: TestModule }, 'TEST_MUTATION');

            const def = moduleRegistry.getDefinition(TestModule);
            const prop = def.getProperty('TEST_MUTATION');

            expect(prop).not.toBeUndefined();
            expect(prop.type).toBe('mutation');
        });
    });

    describe('@Action', () => {
        it('adds action property', () => {
            const ret = Action();
            ret({ constructor: TestModule }, 'testAction');

            const def = moduleRegistry.getDefinition(TestModule);
            const prop = def.getProperty('testAction');

            expect(prop).not.toBeUndefined();
            expect(prop.type).toBe('action');
        });
    });

    describe('@Getter', () => {
        it('adds getter property', () => {
            const ret = Getter();
            ret({ constructor: TestModule }, 'testGetter', { get: jest.fn() });

            const def = moduleRegistry.getDefinition(TestModule);
            const prop = def.getProperty('testGetter');

            expect(prop).not.toBeUndefined();
            expect(prop.type).toBe('getter');
        });
    });

    describe('@State', () => {
        it('adds getter property', () => {
            const ret = State();
            ret({ constructor: TestModule }, 'state');

            const def = moduleRegistry.getDefinition(TestModule);
            const prop = def.getProperty('state');

            expect(prop).not.toBeUndefined();
            expect(prop.type).toBe('state');
        });
    });

    class TestModule extends VuexModule {
        constructor(store: Store<any>) {
            super(store);
        }

        TEST_MUTATION() {
            return 1;
        }

        testAction() {}
    }
});

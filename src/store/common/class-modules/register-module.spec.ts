import { Module } from '@/store/common/class-modules/decorators';
import { registerModule } from '@/store/common/class-modules/register-module';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { Store } from 'vuex';

describe('registerModule()', () => {
    beforeEach(() => {
        VuexModule.clearCache();
    });

    it('throws if no namespace', () => {
        expect(() => registerModule(BadTestModule, { registerModule: jest.fn() } as any)).toThrow();
    });

    it('returns an instance of the type safe module', () => {
        const typeSafe = registerModule<TestModule>(TestModule, { registerModule: jest.fn() } as any);
        expect(typeSafe).toBeInstanceOf(TestModule);
    });

    it('caches the type safe module', () => {
        const typeSafe = registerModule<TestModule>(TestModule, { registerModule: jest.fn() } as any);
        const cached = VuexModule['_instances']['test'];

        expect(typeSafe).toBe(cached);
    });

    it('registers an actual instance with the store', () => {
        const mockStore = {
            registerModule: jest.fn()
        };

        const typeSafe = registerModule<TestModule>(TestModule, mockStore as any);
        expect(mockStore.registerModule).toHaveBeenCalled();
    });

    class BadTestModule extends VuexModule {
        constructor(store: Store<any>) {
            super(store);
        }
    }

    @Module({ namespace: 'test' })
    class TestModule extends VuexModule {
        constructor(store: Store<any>) {
            super(store);
        }
    }
});

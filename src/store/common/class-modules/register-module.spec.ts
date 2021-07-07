import { Module } from '@/store';
import { registerModule } from '@/store/common/class-modules/register-module';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { Store } from 'vuex';

describe('registerModule()', () => {
    it('throws if no namespace', () => {
        expect(() => registerModule(BadTestModule)).toThrow();
    });

    it('returns an instance of the type safe module', () => {
        const typeSafe = registerModule<TestModule>(TestModule);
        expect(typeSafe).toBeInstanceOf(TestModule);
    });

    it('caches the type safe module', () => {});

    it('registers an actual instance with the store', () => {});

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

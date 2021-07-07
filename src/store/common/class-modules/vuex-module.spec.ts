import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { Store } from 'vuex';

describe('VuexModule', () => {
    beforeEach(() => {
        VuexModule.clearCache();
    });

    describe('static cacheModule()', () => {
        it('adds instance to cache', () => {
            const m = new TestModule({} as any);

            VuexModule.cacheModule('fooNamespace', m);
            expect(VuexModule['_instances']['fooNamespace']).toBe(m);
        });

        it('throws on duplicate', () => {
            const m = new TestModule({} as any);

            VuexModule.cacheModule('fooNamespace', m);

            expect(() => {
                VuexModule.cacheModule('fooNamespace', m);
            }).toThrow();
        });
    });

    describe('getModule()', () => {
        it('returns module via namepsace', () => {
            const m = new TestModule({} as any);
            VuexModule.cacheModule('fooNamespace', m);

            const cached = m.getModule('fooNamespace');
            expect(cached).toBe(m);
        });
    });

    class TestModule extends VuexModule {
        constructor(store: Store<any>) {
            super(store);
        }
    }
});

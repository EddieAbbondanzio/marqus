import { VuexModuleDefinition } from '@/store/common/class-modules/vuex-module-definition';
import { VuexModuleProxyHandler } from '@/store/common/class-modules/vuex-module-proxy-handler';

describe('VuexModuleProxyHandler', () => {
    describe('get()', () => {
        it('returns a method to commit mutations', () => {
            const def = new VuexModuleDefinition(null!);
            def.addProperty('mutation', 'TEST_MUTATION', (arg: any) => 1);

            const store = {
                commit: jest.fn()
            };

            const handler = new VuexModuleProxyHandler(def, store as any);
            const callback = handler.get({} as any, 'TEST_MUTATION');

            callback(3);

            expect(store.commit).toHaveBeenCalled();
            expect(store.commit.mock.calls[0][0]).toBe('TEST_MUTATION');
            expect(store.commit.mock.calls[0][1]).toBe(3);
        });

        it('returns a method to dispatch actions', async () => {
            const def = new VuexModuleDefinition(null!);
            def.addProperty('action', 'testAction', (arg: any) => 1);

            const store = {
                dispatch: jest.fn()
            };

            const handler = new VuexModuleProxyHandler(def, store as any);
            const callback = handler.get({} as any, 'testAction');

            callback(5);

            expect(store.dispatch).toHaveBeenCalled();
            expect(store.dispatch.mock.calls[0][0]).toBe('testAction');
            expect(store.dispatch.mock.calls[0][1]).toBe(5);
        });

        it('returns getters', () => {
            const def = new VuexModuleDefinition(null!);
            def.addProperty('getter', 'testGetter', 3);

            const handler = new VuexModuleProxyHandler(def, {} as any);
            const val = handler.get({} as any, 'testGetter');

            expect(val).toBe(3);
        });

        it('returns helper methods', () => {
            const def = new VuexModuleDefinition(null!);
            const obj = {
                randomProperty: 'foo'
            };

            const handler = new VuexModuleProxyHandler(def, {} as any);
            const val = handler.get(obj as any, 'randomProperty');

            expect(val).toBe('foo');
        });
    });
});

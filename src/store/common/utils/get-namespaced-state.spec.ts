import { getNamespacedState } from '@/store/common/utils/get-namespaced-state';

describe('getNamespacedState()', () => {
    it('returns state for root namepsace', () => {
        const namespace = 'namespaceFoo';
        const store = {
            state: {
                namespaceFoo: {
                    baz: 1
                }
            }
        };

        const state = getNamespacedState(store as any, namespace);
        expect(state).toHaveProperty('baz', 1);
    });

    it('returns state for nested namespace', () => {
        const namespace = 'namespaceFoo/namespaceBar';
        const store = {
            state: {
                namespaceFoo: {
                    baz: 1,
                    namespaceBar: {
                        jazz: 2
                    }
                }
            }
        };

        const state = getNamespacedState(store as any, namespace);
        expect(state).toHaveProperty('jazz', 2);
    });
});

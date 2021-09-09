import { UndoContextSettings } from '@/store/plugins/undo/types';
import { undo } from '@/store/plugins/undo/undo';
import { UndoHistory } from '@/store/plugins/undo/undo-history';

describe.skip('undo vuex plugin', () => {
    beforeEach(() => undo.reset());

    describe('plugin()', () => {
        it('caches store', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
            expect(s.store).toHaveProperty('commit');
        });
    });

    describe('registerModule()', () => {
        it('throws if duplicate name', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            undo.registerContext(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'foo',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            expect(() => {
                undo.registerContext(
                    { foo: 1 },
                    {
                        name: 'foo',
                        namespace: 'foo',
                        setStateMutation: 'SET_STATE',
                        stateCacheInterval: 100
                    }
                );
            }).toThrow();
        });

        it('adds set state mutation to ignore list', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            const settings: UndoContextSettings = {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100
            };

            undo.registerContext({ foo: 1 }, settings);
            expect(settings.ignore).toHaveLength(1);
        });

        it('namespaces all ignore list mutations', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            const settings: UndoContextSettings = {
                name: 'foo',
                namespace: 'foo',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100,
                ignore: ['name']
            };

            undo.registerContext({ foo: 1 }, settings);
            expect(settings.ignore).toHaveLength(2);
            expect(settings.ignore![0]).toBe('foo/SET_STATE');
            expect(settings.ignore![1]).toBe('foo/name');
        });

        it('adds the module', () => {
            const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);

            undo.registerContext(
                { foo: 1 },
                {
                    name: 'foo',
                    namespace: 'foo',
                    setStateMutation: 'SET_STATE',
                    stateCacheInterval: 100
                }
            );

            expect(s.contexts['foo']).toBeTruthy();
        });
    });

    describe('reset()', () => {
        const s = undo.plugin({ commit: jest.fn(), subscribe: jest.fn() } as any);
        undo.registerContext(
            { foo: 1 },
            {
                name: 'foo',
                namespace: 'fooNamespace',
                setStateMutation: 'SET_STATE',
                stateCacheInterval: 100,
                ignore: ['IGNORED_MUT']
            }
        );

        undo.reset();
        expect(s.contexts).toEqual({});
    });
});

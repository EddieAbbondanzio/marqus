import { getModuleFileName, persist } from '@/store/plugins/persist/persist';

describe('Persist plugin', () => {
    beforeEach(() => {
        persist.modules.length = 0;
    });

    describe('register()', () => {
        it('throws error on duplicate module.', () => {
            persist.modules.push({
                scheduler: null!,
                settings: {
                    namespace: 'cat',
                    initMutation: ''
                }
            });

            expect(() => {
                persist.register({
                    namespace: 'cat',
                    initMutation: ''
                });
            }).toThrow();
        });

        it('adds module to modules array', () => {
            persist.register({
                namespace: 'cat',
                initMutation: 'INIT'
            });

            expect(persist.modules).toHaveLength(1);
            expect(persist.modules[0].settings).toHaveProperty('namespace', 'cat');
        });
    });

    describe('getModuleFileName()', () => {
        it('returns fileName if defined', () => {
            const name = getModuleFileName({
                settings: { namespace: 'cat', fileName: 'dog.json', initMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('dog.json');
        });

        it('returns namespace if no fileName specified.', () => {
            const name = getModuleFileName({
                settings: { namespace: 'cat', initMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('cat.json');
        });

        it('returns deepest namespace if nested namespace', () => {
            const name = getModuleFileName({
                settings: { namespace: 'super/nested/cat', initMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('cat.json');
        });
    });
});

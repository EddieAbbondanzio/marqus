import { getModuleFileName } from '@/store/plugins/persist/persist';

describe('Persist plugin', () => {
    describe('register()', () => {
        it('throws error on duplicate module.', () => {
            expect(process.env.NODE_ENV).toBe('cat');
        });

        it('adds module to modules array', () => {});
    });

    describe('getModuleFileName()', () => {
        it('returns fileName if defined', () => {
            const name = getModuleFileName({
                settings: { namespace: 'cat', fileName: 'dog.json', initiMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('dog.json');
        });

        it('returns namespace if no fileName specified.', () => {
            const name = getModuleFileName({
                settings: { namespace: 'cat', initiMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('cat.json');
        });

        it('returns deepest namespace if nested namespace', () => {
            const name = getModuleFileName({
                settings: { namespace: 'super/nested/cat', initiMutation: '' },
                scheduler: null!
            });

            expect(name).toBe('cat.json');
        });
    });
});

import { UndoStateCache } from '@/store/plugins/undo/undo-state-cache';

describe('UndoStateCache', () => {
    describe('ctor()', () => {
        it('sets initial state under 0', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            const state = stateCache.cache.get(0);

            expect(state).toHaveProperty('foo');
        });
    });

    describe('push()', () => {
        it('adds cache at the next appropriate index', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            stateCache.push({ foo: 2 });

            const state = stateCache.cache.get(100);
            expect(state).toHaveProperty('foo', 2);
        });
    });

    describe('getLast()', () => {
        it('returns the most recent cache relative to the index passed', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            stateCache.push({ foo: 2 });

            const returnVal = stateCache.getLast(127);
            expect(returnVal.state).toHaveProperty('foo', 2);
        });
    });

    describe('deleteAfter()', () => {
        it('trims off the end', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            stateCache.push({ foo: 2 });
            stateCache.push({ foo: 3 });

            stateCache.deleteAfter(100);

            expect(stateCache.cache.size).toBe(2);
        });
    });

    describe('_calculateNextIndex()', () => {
        it('calculates next index from start', () => {
            const stateCache = new UndoStateCache({ foo: 1 });

            const nextIndex = stateCache['_calculateNextIndex']();
            expect(nextIndex).toBe(100);
        });

        it('calculates next index from anywhere', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            stateCache.push({ foo: 2 });

            const nextIndex = stateCache['_calculateNextIndex']();
            expect(nextIndex).toBe(200);
        });
    });

    describe('_calculateLast()', () => {
        it('returns correctly', () => {
            const stateCache = new UndoStateCache({ foo: 1 });
            stateCache.push({ foo: 2 });

            const lastIndex = stateCache['_calculateLast'](120);
            expect(lastIndex).toBe(100);
        });
    });
});

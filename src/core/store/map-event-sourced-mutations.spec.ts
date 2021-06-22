import { EventHistory } from '@/core/store/plugins/undo/event-history';
import { mapEventSourcedMutations } from '@/core/store/map-event-sourced-mutations';

describe('mapEventSourcedMutations()', () => {
    describe('APPLY', () => {
        it('triggers apply', () => {
            const h = new EventHistory();
            const apply = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply,
                undo: jest.fn(),
                history: () => h
            });

            mutations.APPLY({}, {} as any);
            expect(apply).toHaveBeenCalled();
        });

        it('adds event to history', () => {
            const h = new EventHistory();
            const apply = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply,
                undo: jest.fn(),
                history: () => h
            });

            const e = {
                type: 'foo'
            };
            mutations.APPLY({}, e);
            expect(h.events).toHaveLength(1);
            expect(h.events[0]).toHaveProperty('type', 'foo');
        });
    });

    describe('UNDO', () => {
        it('checks if we can rewind first', () => {
            expect(() => {
                const h = new EventHistory();

                const mutations = mapEventSourcedMutations({
                    apply: jest.fn(),
                    undo: jest.fn(),
                    history: () => h
                });

                mutations.UNDO({});
            }).not.toThrow();
        });

        it('triggers undo', () => {
            const h = new EventHistory();
            const undo = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply: jest.fn(),
                undo,
                history: () => h
            });

            const e = {
                type: 'foo'
            };
            mutations.APPLY({}, e);
            mutations.UNDO({});

            expect(undo).toHaveBeenCalled();
        });

        it('moves the history back one step', () => {
            const h = new EventHistory();
            const undo = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply: jest.fn(),
                undo,
                history: () => h
            });

            const e = {
                type: 'foo'
            };
            mutations.APPLY({}, e);
            mutations.UNDO({});

            expect(h.currentIndex).toBe(-1);
        });
    });

    describe('REDO', () => {
        it('checks if it can fast forward first', () => {
            expect(() => {
                const h = new EventHistory();

                const mutations = mapEventSourcedMutations({
                    apply: jest.fn(),
                    undo: jest.fn(),
                    history: () => h
                });

                mutations.REDO({});
            }).not.toThrow();
        });

        it('triggers apply ', () => {
            const h = new EventHistory();
            const apply = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply,
                undo: jest.fn(),
                history: () => h
            });

            const e = {
                type: 'foo'
            };
            mutations.APPLY({}, e);
            mutations.UNDO({});
            mutations.REDO({});

            expect(apply).toHaveBeenCalled();
        });

        it('moves the history forward one step', () => {
            const h = new EventHistory();
            const undo = jest.fn();

            const mutations = mapEventSourcedMutations({
                apply: jest.fn(),
                undo,
                history: () => h
            });

            const e = {
                type: 'foo'
            };
            mutations.APPLY({}, e);
            mutations.UNDO({});
            mutations.REDO({});

            expect(h.currentIndex).toBe(0);
        });
    });
});

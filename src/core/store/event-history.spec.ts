import { EventHistory } from '@/core/store/event-history';

describe('EventHistory {}', () => {
    let history: EventHistory<any>;

    beforeEach(() => {
        history = new EventHistory();
    });

    describe('ctor', () => {
        it('initializes events, and currentIndex', () => {
            expect(history.events).toHaveLength(0);
            expect(history.currentIndex).toBe(-1);
        });
    });

    describe('canRewind()', () => {
        it('returns false when no events', () => {
            expect(history.canRewind()).toBeFalsy();
        });

        it('returns true when current index is not -1', () => {
            history.push({ type: 'foo' });
            expect(history.canRewind()).toBeTruthy();
        });
    });

    describe('canFastForward()', () => {
        it('returns false if no events', () => {
            expect(history.canFastForward()).toBeFalsy();
        });

        it('returns false if currently at the last event', () => {
            history.push({ type: 'foo' });
            expect(history.canFastForward()).toBeFalsy();
        });

        it('returns true when we rewinded', () => {
            history.push({
                type: 'foo'
            });

            history.rewind();
            expect(history.canFastForward()).toBeTruthy();
        });
    });

    describe('push()', () => {
        it('adds event to array', () => {
            history.push({
                type: 'foo'
            });

            expect(history.events).toHaveLength(1);
            expect(history.currentIndex).toBe(0);
        });

        it('nukes oprhans when we rewind and change directions', () => {
            history.push({
                type: 'foo'
            });

            history.push({
                type: 'bar'
            });

            history.push({
                type: 'baz'
            });

            history.rewind();

            history.push({
                type: 'new'
            });

            expect(history.events).toHaveLength(3);
            expect(history.events[0]).toHaveProperty('type', 'foo');
            expect(history.events[1]).toHaveProperty('type', 'bar');
            expect(history.events[2]).toHaveProperty('type', 'new');

            expect(history.currentIndex).toBe(2);
        });
    });

    describe('rewind()', () => {
        it('throws if cannot rewind', () => {
            expect(history.rewind).toThrow();
        });

        it('returns rewinded event', () => {
            history.push({ type: 'foo' });
            const e = history.rewind();
            expect(e).toHaveProperty('type', 'foo');
        });

        it('does not remove events from array', () => {
            history.push({ type: 'foo' });
            history.rewind();
            expect(history.events).toHaveLength(1);
        });
    });

    describe('fastForward()', () => {
        it('throws if cannot fast forward', () => {
            expect(history.fastForward).toThrow();
        });

        it('returns fast forwarded event', () => {
            history.push({ type: 'foo' });
            history.rewind();
            const e = history.fastForward();

            expect(e).toHaveProperty('type', 'foo');
        });

        it('does not remove events from array', () => {
            history.push({ type: 'foo' });
            history.rewind();
            history.fastForward();

            expect(history.events).toHaveLength(1);
        });
    });
});

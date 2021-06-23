import { UndoHistory, UndoHistoryEvent } from '@/store/plugins/undo/undo-history';

describe('UndoHistory', () => {
    describe('ctor()', () => {
        it('throws if index is less than -1', () => {
            expect(() => {
                new UndoHistory([], -2);
            }).toThrow();
        });

        it('throws if current index exceeds event history range.', () => {
            expect(() => {
                new UndoHistory([{} as any], 2);
            }).toThrow();
        });
    });

    describe('push()', () => {
        it('adds event to end of list', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const history = new UndoHistory(events, 2);
            history.push({ payload: { type: 'd', payload: 4 } });

            expect(history.events[3].payload).toHaveProperty('type', 'd');
            expect(history.currentIndex).toBe(3);
        });

        it('trims off extra if we rewind and go in a different direction', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const history = new UndoHistory(events, 1);
            history.push({ payload: { type: 'd', payload: 4 } });

            expect(history.events).toHaveLength(3);
        });
    });

    describe('rewind()', () => {
        it("throws if we can't rewind", () => {
            expect(() => {
                const h = new UndoHistory();
                h.rewind();
            }).toThrow();
        });

        it('rewinds current position', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, 0);
            h.rewind();
            expect(h.currentIndex).toBe(-1);
        });
    });

    describe('fastForward()', () => {
        it("throws if we can't fast forward", () => {
            expect(new UndoHistory().fastForward).toThrow();
        });

        it('moves current position forward', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, 0);
            h.fastForward();
            expect(h.currentIndex).toBe(1);
        });
    });

    describe('canRewind()', () => {
        it('returns true when we can.', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, 0);
            expect(h.canRewind()).toBeTruthy();
        });

        it('returns false when we are at the start', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, -1);
            expect(h.canRewind()).toBeFalsy();
        });
    });

    describe('canFastForward()', () => {
        it('returns true if we can', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, 0);
            expect(h.canFastForward()).toBeTruthy();
        });

        it('returns false if we are at the end', () => {
            const events: UndoHistoryEvent[] = [
                { payload: { type: 'a', payload: 1 } },
                { payload: { type: 'b', payload: 2 } },
                { payload: { type: 'c', payload: 3 } }
            ];

            const h = new UndoHistory(events, 2);
            expect(h.canFastForward()).toBeFalsy();
        });
    });
});

import { UndoItemOrGroup, UndoMetadata } from '@/store/plugins/undo/types';
import { UndoHistory } from '@/store/plugins/undo/undo-history';
import { MutationPayload } from 'vuex';

describe('UndoHistory', () => {
    describe('ctor()', () => {
        it('throws if index is less than 0', () => {
            expect(() => {
                new UndoHistory([], -1);
            }).toThrow();
        });

        it('throws if current index exceeds event history range.', () => {
            expect(() => {
                new UndoHistory([{} as any], 2);
            }).toThrow();
        });
    });

    describe('push()', () => {
        it('adds a grouped mutation to the active group', () => {
            const history = new UndoHistory();
            const id = history.startGroup();

            const mut: MutationPayload = {
                type: 'foo',
                payload: {
                    undo: {
                        groupId: id
                    }
                }
            };

            history.push(mut);
            const group = history['_activeGroups'][id];

            expect(group.mutations[0]).toHaveProperty('type', 'foo');
        });

        it('throws if no group found', () => {
            const history = new UndoHistory();

            const mut: MutationPayload = {
                type: 'foo',
                payload: {
                    undo: {
                        groupId: '1234'
                    }
                }
            };

            expect(() => history.push(mut)).toThrow();
        });

        it('adds event to end on normal push', () => {
            const history = new UndoHistory();
            history.push({
                type: 'foo',
                payload: { value: 1 }
            });

            expect(history['_events'][0]).toHaveProperty('type', 'foo');
        });

        it('on replay, it only increments current index', () => {
            const history = new UndoHistory([{} as any, {} as any], 0);

            history.push({
                type: 'foo',
                payload: { value: 1, undo: { isReplay: true } as UndoMetadata }
            });

            expect(history['_events']).toHaveLength(2);
            expect(history.currentIndex).toBe(1);
        });

        it('on changing directions it removes old future events and adds new one', () => {
            const history = new UndoHistory([{} as any, {} as any], 0);

            history.push({
                type: 'foo',
                payload: { value: 1 }
            });

            expect(history['_events']).toHaveLength(1);
            expect(history.currentIndex).toBe(1);
        });
    });

    describe('rewind()', () => {
        it("throws if can't rewind", () => {
            const history = new UndoHistory();
            expect(history.undo).toThrow();
        });

        it('returns mutations to replay', () => {
            const history = new UndoHistory(
                [
                    { type: 'foo', payload: {} },
                    { type: 'bar', payload: {} }
                ],
                2
            );
            const toReplay = history.undo(0);

            expect(toReplay).toHaveLength(1);
            expect((toReplay[0] as MutationPayload).payload.undo).toHaveProperty('isReplay', true);
        });
    });

    describe('fastForward()', () => {
        it("throws if can't fast forward", () => {
            const history = new UndoHistory();
            expect(history.redo).toThrow();
        });

        it('returns mutation to replay', () => {
            const history = new UndoHistory(
                [
                    { type: 'foo', payload: {} },
                    { type: 'bar', payload: {} }
                ],
                0
            );

            const mut = history.redo();
            expect(mut).toHaveProperty('type', 'foo');
            expect((mut as MutationPayload).payload.undo).toHaveProperty('isReplay', true);
        });
    });

    describe('canRewind()', () => {
        it('returns true if current index > 0', () => {
            const history = new UndoHistory();
            history.push({ payload: {} } as any);
            expect(history.canUndo()).toBeTruthy();
        });

        it('returns false if currentIndex is 0', () => {
            const history = new UndoHistory();
            expect(history.canUndo()).toBeFalsy();
        });
    });

    describe('canFastForward()', () => {
        it('returns true if events length > 0, and current index is less than events length', () => {
            const history = new UndoHistory();
            history.push({ payload: {} } as any);
            history.push({ payload: {} } as any);
            history.push({ payload: {} } as any);

            history['_currentIndex'] = 1;
            expect(history.canRedo()).toBeTruthy();
        });

        it('returns false if events is 0', () => {
            const history = new UndoHistory();
            expect(history.canRedo()).toBeFalsy();
        });

        it('returns false if current index is not less than events length', () => {
            const history = new UndoHistory();
            history.push({ payload: {} } as any);
            history.push({ payload: {} } as any);
            history.push({ payload: {} } as any);

            expect(history.canRedo()).toBeFalsy();
        });
    });

    describe('startGroup()', () => {
        it('creates new active group on map', () => {
            const history = new UndoHistory();
            const id = history.startGroup();

            expect(typeof id).toBe('string');
            expect(history['_activeGroups'][id]).not.toBeNull();
        });
    });

    describe('stopGroup()', () => {
        it('throws if no group to stop', () => {
            const history = new UndoHistory();
            expect(() => history.stopGroup('foo')).toThrow();
        });

        it('deletes group', () => {
            const history = new UndoHistory();
            const id = history.startGroup();

            history.stopGroup(id);
            expect(history['_activeGroups'][id]).toBeUndefined();
        });
    });
});

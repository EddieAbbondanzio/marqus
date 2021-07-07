import { Queue } from '@/shared/data-structures/queue';

describe('Queue<T>', () => {
    describe('ctor()', () => {
        it('throws if limit is 0', () => {
            expect(() => new Queue([], 0)).toThrow();
        });

        it('throws if limit is negative and not -1', () => {
            expect(() => new Queue([], -2)).toThrow();
        });

        it('allows limit of -1', () => {
            expect(() => new Queue([], -1)).not.toThrow();
        });
    });

    describe('enqueue()', () => {
        it('adds item to the end of the line', () => {
            const items = ['a', 'b', 'c', 'd'];
            const q = new Queue(items);

            q.enqueue('e');
            expect(items[0]).toBe('a');
            expect(items[1]).toBe('b');
            expect(items[2]).toBe('c');
            expect(items[3]).toBe('d');
            expect(items[4]).toBe('e');
        });

        it('removes first item if the queue is over the limit', () => {
            const items = ['a', 'b', 'c'];
            const q = new Queue(items, 3);

            q.enqueue('d');
            expect(items).toHaveLength(3);
            expect(items[0]).toBe('b');
            expect(items[1]).toBe('c');
            expect(items[2]).toBe('d');
        });
    });

    describe('dequeue()', () => {
        it('throws if empty', () => {
            expect(new Queue().dequeue).toThrow();
        });

        it('removes the first item', () => {
            const items = [1, 2, 3, 4];
            const q = new Queue(items);

            const item = q.dequeue();
            expect(item).toBe(1);

            expect(items).toHaveLength(3);
            expect(items[0]).toBe(2);
            expect(items[1]).toBe(3);
            expect(items[2]).toBe(4);
        });
    });

    describe('isEmpty()', () => {
        it('returns false if the queue has any content', () => {
            expect(new Queue([1]).isEmpty()).toBeFalsy();
        });

        it('returns true if the queue is empty', () => {
            expect(new Queue().isEmpty()).toBeTruthy();
        });
    });
});

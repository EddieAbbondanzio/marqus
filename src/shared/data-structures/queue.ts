/**
 * First in, first out (FIFO) data structure. Useful for processing things in the order they
 * were inserted in.
 */
export class Queue<T> {
    static readonly UNLIMITED = -1;

    /**
     * Create a new queue.
     * @param items Contents of the queue
     * @param limit The maximum number of items allowed in the queue.
     */
    constructor(public items: T[] = [], public limit = Queue.UNLIMITED) {
        if (this.limit <= 0 && this.limit !== -1) {
            throw Error('Limit must be 1 or greater');
        }
    }

    /**
     * Add an item to the back of the line.
     * @param item The item to add.
     */
    enqueue(item: T) {
        this.items.push(item);

        // If the queue is over it's limit, remove the first item to bring it back into spec.
        if (this.limit !== Queue.UNLIMITED && this.limit < this.items.length) {
            this.items.shift();
        }
    }

    /**
     * Take an item from the front of the line.
     * @returns The first item.
     */
    dequeue(): T {
        if (this.isEmpty()) {
            throw Error('Queue is empty.');
        }

        return this.items.shift()!;
    }

    /**
     * Check if the queue has any items in it.
     * @returns True if the queue has no items.
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

export type Task = () => Promise<any>;

/**
 * Scheduler to help run async tasks in a single file manner.
 * Useful for preventing race conditions.
 */
export class TaskScheduler {
    /**
     * Does the scheduler have tasks waiting to be executed?
     */
    get hasTasks(): boolean {
        return this.queue.length > 0;
    }

    /**
     * If the scheduler is currently running a task.
     */
    hasActiveTask = false;

    private queue: Task[];

    constructor(public queueSize: number) {
        if (queueSize <= 0) {
            throw Error('Queue size must be 1 or greater.');
        }

        this.queue = [];
    }

    async schedule(task: Task): Promise<void> {
        // Ensure the queue isn't too long, before adding another task.
        if (this.queue.length >= this.queueSize) {
            return;
        }

        this.queue.push(task);

        // Start a task if we haven't yet.
        if (!this.hasActiveTask) {
            this.startNext();
        }
    }

    private async startNext() {
        if (!this.hasTasks) {
            throw Error('No next task to start.');
        }

        const t = this.queue.shift()!;

        this.hasActiveTask = true;
        await t();
        this.hasActiveTask = false;

        // Keep going?
        if (this.hasTasks) {
            this.startNext();
        }
    }
}

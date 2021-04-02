export class CountdownTimer {
    timer: NodeJS.Timer | null = null;
    isFinished = false;
    start = 0;

    constructor(public callback: () => void, public milliseconds: number) {
        this.setTimeout(callback, milliseconds);
    }

    setTimeout(callback: () => void, ms: number) {
        const self = this;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.isFinished = false;
        this.callback = callback;
        this.milliseconds = ms;

        this.timer = setTimeout(function() {
            self.isFinished = true;
            callback();
        }, ms);

        this.start = Date.now();
    }

    add(ms: number) {
        if (!this.isFinished) {
            const newTime = Math.min(this.milliseconds - (Date.now() - this.start) + ms, 5000);
            this.setTimeout(this.callback, newTime);
        }
    }
}

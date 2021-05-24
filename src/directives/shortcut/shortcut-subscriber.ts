export class ShortcutSubscriber {
    constructor(
        public shortcutName: string,
        private callback: (shortcutName: string) => void,
        public el?: HTMLElement
    ) {}

    notify() {
        this.callback(this.shortcutName);
    }
}

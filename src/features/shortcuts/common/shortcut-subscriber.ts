export type ShortcutCallback = (shortcutName: string) => any;

export class ShortcutSubscriber {
    constructor(
        public shortcutName: string,
        private callback: ShortcutCallback,
        public el?: HTMLElement,
        public when?: () => boolean
    ) {}

    notify() {
        this.callback(this.shortcutName);
    }
}

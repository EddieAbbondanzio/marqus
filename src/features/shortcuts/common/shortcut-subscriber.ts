export type ShortcutCallback = (shortcutName: string) => any;

export class ShortcutSubscriber {
    // eslint-disable-next-line
    constructor(public shortcutName: string, private callback: ShortcutCallback, public el?: HTMLElement) {}

    notify() {
        this.callback(this.shortcutName);
    }
}

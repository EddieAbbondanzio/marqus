export class ShortcutSubscriber {
    constructor(public shortcutName: string, private callback: (shortcutName: string) => void) {}

    notify() {
        this.callback(this.shortcutName);
    }
}

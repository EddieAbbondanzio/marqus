import { KeyCode, parseKey } from '@/directives/shortcut/key-code';
import { Shortcut } from '@/directives/shortcut/shortcut';
import { ShortcutSubscriber } from '@/directives/shortcut/shortcut-subscriber';

export class ShortcutManager {
    shortcuts: Shortcut[];
    activeKeys: { [key: string]: boolean };
    subscribers: { [shortcutName: string]: ShortcutSubscriber[] };

    constructor() {
        this.shortcuts = [];
        this.activeKeys = {};
        this.subscribers = {};

        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
    }

    _onKeyDown(e: KeyboardEvent) {
        const key = parseKey(e.code);

        if (this.activeKeys[key] != null) {
            return;
        }

        this.activeKeys[key] = true;

        // Retrieve the set of keys currently pressed down.
        const activeKeys = Object.keys(this.activeKeys);

        this.shortcuts.forEach((s) => {
            // Did we hit a match? TODO: Refactor this for performance reasons?
            if (s.isMatch(activeKeys as any[])) {
                const subsToNotify = this.subscribers[s.name];

                // Notify the listeners for the shortcut.
                if (subsToNotify != null) {
                    for (const sub of subsToNotify) {
                        sub.notify();
                    }
                }
            }
        });
    }

    _onKeyUp(e: KeyboardEvent) {
        const key = parseKey(e.code);
        delete this.activeKeys[key];
    }

    define(shortcutName: string, keys: KeyCode[]) {
        this.shortcuts.push(new Shortcut(shortcutName, keys));
    }

    subscribe(shortcutName: string, callback: (shortcutName: string) => any): ShortcutSubscriber {
        const sub = new ShortcutSubscriber(shortcutName, callback);

        if (this.subscribers[shortcutName] == null) {
            this.subscribers[shortcutName] = [sub];
            console.log('created');
        } else {
            this.subscribers[shortcutName].push(sub);
            console.log('added');
        }

        return sub;
    }

    unsubscribe(subscriber: ShortcutSubscriber) {
        const shortcutName = subscriber.shortcutName;
        this.subscribers[shortcutName] = this.subscribers[shortcutName].filter((s) => s !== subscriber);
    }

    dispose() {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }
}

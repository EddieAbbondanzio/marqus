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

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
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

    register(shortcut: Shortcut | Shortcut[]) {
        if (Array.isArray(shortcut)) {
            this.shortcuts.push(...shortcut);
        } else {
            this.shortcuts.push(shortcut);
        }
    }

    subscribe(shortcutName: string, callback: (shortcutName: string) => any, el?: HTMLElement): ShortcutSubscriber {
        const sub = new ShortcutSubscriber(shortcutName, callback, el);

        if (this.subscribers[shortcutName] == null) {
            this.subscribers[shortcutName] = [sub];
        } else {
            this.subscribers[shortcutName].push(sub);
        }

        return sub;
    }

    unsubscribe(subscriber: ShortcutSubscriber) {
        const shortcutName = subscriber.shortcutName;
        this.subscribers[shortcutName] = this.subscribers[shortcutName].filter((s) => s !== subscriber);
    }

    getSubscribersByElement(el: HTMLElement) {
        const subs = Object.values(this.subscribers).flat();
        return subs.filter((s) => s.el === el);
    }

    reset() {
        this.subscribers = {};
        this.activeKeys = {};
        this.shortcuts = [];
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}

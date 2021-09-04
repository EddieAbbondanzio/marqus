import { KeyCode, parseKey } from '@/features/shortcuts/shared/key-code';
import { Shortcut } from '@/features/shortcuts/shared/shortcut';
import { ShortcutCallback, ShortcutSubscriber } from '@/features/shortcuts/shared/shortcut-subscriber';

let shortcuts: Shortcut[] = [];
let activeKeys: { [key: string]: boolean } = {};
let subscribers: { [shortcutName: string]: ShortcutSubscriber[] } = {};

function onKeyDown(e: KeyboardEvent) {
    const key = parseKey(e.code);

    // Disable default arrow key actions
    if (
        key === KeyCode.ArrowLeft ||
        key === KeyCode.ArrowRight ||
        key === KeyCode.ArrowUp ||
        key === KeyCode.ArrowDown
    ) {
        e.preventDefault();
    }

    if (activeKeys[key] != null) {
        return;
    }

    activeKeys[key] = true;

    // Retrieve the set of keys currently pressed down.
    const active = Object.keys(activeKeys);

    shortcuts.forEach((s) => {
        // Did we hit a match? TODO: Refactor this for performance reasons?
        if (s.isMatch(active as any[])) {
            const subsToNotify = subscribers[s.name];
            // Notify the listeners for the shortcut.
            if (subsToNotify != null) {
                for (const sub of subsToNotify) {
                    sub.notify();
                }
            }
        }
    });
}

function onKeyUp(e: KeyboardEvent) {
    const key = parseKey(e.code);
    delete activeKeys[key];
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

export const shortcutManager = {
    register(shortcut: Shortcut | Shortcut[]) {
        if (Array.isArray(shortcut)) {
            shortcuts.push(...shortcut);
        } else {
            shortcuts.push(shortcut);
        }
    },
    subscribe(
        shortcutName: string,
        callback: ShortcutCallback,
        opts?: { el?: HTMLElement; when?: () => boolean }
    ): ShortcutSubscriber {
        const sub = new ShortcutSubscriber(shortcutName, callback, opts?.el, opts?.when);

        if (subscribers[shortcutName] == null) {
            subscribers[shortcutName] = [sub];
        } else {
            subscribers[shortcutName].push(sub);
        }

        return sub;
    },
    unsubscribe(subscriber: ShortcutSubscriber) {
        const shortcutName = subscriber.shortcutName;
        subscribers[shortcutName] = subscribers[shortcutName].filter((s) => s !== subscriber);
    },
    getSubscribersByElement(el: HTMLElement) {
        const subs = Object.values(subscribers).flat();
        return subs.filter((s) => s.el === el);
    },
    reset() {
        subscribers = {};
        activeKeys = {};
        shortcuts = [];
    },
    dispose() {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }
};

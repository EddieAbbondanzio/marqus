import { KeyCode, parseKey } from "@/utils/shortcuts/key-code";
import { Shortcut } from "@/utils/shortcuts/shortcut";
import {
  ShortcutCallback,
  ShortcutSubscriber
} from "@/utils/shortcuts/shortcut-subscriber";

let defined: Shortcut[] = [];
let activeKeys: { [key: string]: boolean } = {};
let subscribers: { [shortcutName: string]: ShortcutSubscriber[] } = {};

export function _onKeyDown(e: KeyboardEvent) {
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

  defined.forEach(s => {
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

export function _onKeyUp(e: KeyboardEvent) {
  const key = parseKey(e.code);
  delete activeKeys[key];
}

window.addEventListener("keydown", _onKeyDown);
window.addEventListener("keyup", _onKeyUp);

export const shortcuts = {
  register(shortcut: Shortcut | Shortcut[]) {
    if (Array.isArray(shortcut)) {
      defined.push(...shortcut);
    } else {
      defined.push(shortcut);
    }
  },
  subscribe(
    shortcutName: string,
    callback: ShortcutCallback,
    opts?: { el?: HTMLElement; when?: () => boolean }
  ): ShortcutSubscriber {
    const sub = new ShortcutSubscriber(
      shortcutName,
      callback,
      opts?.el,
      opts?.when
    );

    if (subscribers[shortcutName] == null) {
      subscribers[shortcutName] = [sub];
    } else {
      subscribers[shortcutName].push(sub);
    }

    return sub;
  },
  unsubscribe(subscriber: ShortcutSubscriber) {
    const shortcutName = subscriber.shortcutName;
    subscribers[shortcutName] = subscribers[shortcutName].filter(
      s => s !== subscriber
    );
  },
  getSubscribersByElement(el: HTMLElement) {
    const subs = Object.values(subscribers).flat();
    return subs.filter(s => s.el === el);
  },
  reset() {
    subscribers = {};
    activeKeys = {};
    defined = [];
  },
  dispose() {
    window.removeEventListener("keydown", _onKeyDown);
    window.removeEventListener("keyup", _onKeyUp);
  }
};

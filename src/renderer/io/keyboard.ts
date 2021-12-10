import { RefObject, useEffect, useState } from "react";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";

export type KeyboardEventType = "keydown" | "keyup" | "press";

export interface KeyboardListenOpts<Keys extends KeyCode[]> {
  event: KeyboardEventType;
  keys?: Keys;
}

export type KeyboardCallback<Keys extends KeyCode[]> = (
  ev: KeyboardEvent,
  key: Keys[number]
) => Promise<void>;

export interface Keyboard {
  listen<Keys extends KeyCode[]>(
    opts: KeyboardListenOpts<Keys>,
    callback: KeyboardCallback<Keys>
  ): void;
}

export class KeyboardController implements Keyboard {
  constructor(public element?: RefObject<HTMLElement>) {}

  listeners: {
    [ev in KeyboardEventType]+?: {
      callback: KeyboardCallback<KeyCode[]>;
      keys?: KeyCode[];
    };
  } = {};

  listen<Keys extends KeyCode[]>(
    opts: KeyboardListenOpts<Keys>,
    callback: KeyboardCallback<Keys>
  ): void {
    this.listeners[opts.event] = {
      ...opts,
      callback,
    };
  }

  notify(event: KeyboardEvent, type: KeyboardEventType) {
    const key = parseKeyCode(event.code);
    const listener = this.listeners[type];

    if (listener == null) {
      return;
    }

    if (
      this.element?.current != null &&
      event.target !== this.element.current
    ) {
      return;
    }

    if (listener.keys != null && listener.keys.every((k) => k !== key)) {
      return;
    }

    listener.callback(event, key);
  }
}

export function useKeyboard(element?: RefObject<HTMLElement>): Keyboard {
  const keyboard = new KeyboardController(element);

  const onKeyDown = (ev: KeyboardEvent) => keyboard.notify(ev, "keydown");
  const onKeyPress = (ev: KeyboardEvent) => keyboard.notify(ev, "press");
  const onKeyUp = (ev: KeyboardEvent) => keyboard.notify(ev, "keyup");

  useEffect(() => {
    const target = element?.current ?? window;

    target.addEventListener("keydown", onKeyDown);
    target.addEventListener("keypress", onKeyPress);
    target.addEventListener("keyup", onKeyUp);

    return () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keypress", onKeyPress);
      target.removeEventListener("keyup", onKeyUp);
    };
  });

  return keyboard;
}
